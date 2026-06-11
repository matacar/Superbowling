/**
 * Capa de CONSULTAS del panel (solo lectura, lado servidor).
 *
 * Lee la base real con la service role (las páginas ya están autorizadas por
 * el layout del panel). Es la misma base que la web pública: lo que aquí se ve
 * es exactamente lo que hay. Las acciones de escritura (crear/cancelar/bloquear)
 * llegan en F-D.
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import { getSettings } from "@/lib/reservations/settings";
import {
  dayHoursFor,
  minutesToLabel,
  nowInBogota,
  parseHM,
} from "@/lib/reservations/time";
import type { Customer, ReservationStatus } from "@/lib/reservations/types";

export type OpStatus = "pendiente_llegada" | "llego" | "no_show" | "completada";

export type AdminReservation = {
  id: string;
  laneId: number;
  date: string;
  startSlot: number;
  turns: number;
  players: number;
  customer: Customer;
  status: ReservationStatus;
  opStatus: OpStatus;
  holdExpiresAt: string | null;
  amountTotal: number;
  amountDeposit: number;
  currency: "COP";
  reference: string;
  wompiTransactionId: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  lane_id: number;
  reservation_date: string;
  start_slot: number;
  turns: number;
  players: number;
  customer: Customer;
  status: ReservationStatus;
  op_status: OpStatus;
  hold_expires_at: string | null;
  amount_total: number | string;
  amount_deposit: number | string;
  currency: "COP";
  reference: string;
  wompi_transaction_id: string | null;
  created_at: string;
};

const COLS =
  "id, lane_id, reservation_date, start_slot, turns, players, customer, status, op_status, hold_expires_at, amount_total, amount_deposit, currency, reference, wompi_transaction_id, created_at";

/** Estados que OCUPAN una pista. */
export const ACTIVE: ReservationStatus[] = ["hold", "pending_payment", "confirmed"];

function map(r: Row): AdminReservation {
  return {
    id: r.id,
    laneId: r.lane_id,
    date: r.reservation_date,
    startSlot: r.start_slot,
    turns: r.turns,
    players: r.players,
    customer: r.customer,
    status: r.status,
    opStatus: r.op_status,
    holdExpiresAt: r.hold_expires_at,
    amountTotal: Number(r.amount_total),
    amountDeposit: Number(r.amount_deposit),
    currency: r.currency,
    reference: r.reference,
    wompiTransactionId: r.wompi_transaction_id,
    createdAt: r.created_at,
  };
}

function overlaps(aStart: number, aTurns: number, bStart: number, bTurns: number) {
  return aStart < bStart + bTurns && bStart < aStart + aTurns;
}

/** Etiqueta horaria ("6:00 p. m.") de una franja por su índice, para una fecha. */
export function slotLabelFor(date: string, index: number): string {
  const s = getSettings();
  const hours = dayHoursFor(date, s);
  if (!hours) return `#${index}`;
  return minutesToLabel(parseHM(hours.open) + index * s.turn.durationMinutes);
}

/** Rango horario de una reserva ("6:00 p. m. – 8:00 p. m."). */
export function timeRangeFor(date: string, startSlot: number, turns: number): string {
  const s = getSettings();
  const hours = dayHoursFor(date, s);
  if (!hours) return `#${startSlot}`;
  const open = parseHM(hours.open);
  const a = minutesToLabel(open + startSlot * s.turn.durationMinutes);
  const b = minutesToLabel(open + (startSlot + turns) * s.turn.durationMinutes);
  return `${a} – ${b}`;
}

/** Índice de la franja que contiene "ahora" en Colombia (null si está cerrado). */
export function currentSlotIndex(date: string, now = nowInBogota()): number | null {
  const s = getSettings();
  const hours = dayHoursFor(date, s);
  if (!hours) return null;
  const open = parseHM(hours.open);
  const close = parseHM(hours.close);
  if (now.ymd !== date) return null;
  if (now.minutes < open || now.minutes >= close) return null;
  return Math.floor((now.minutes - open) / s.turn.durationMinutes);
}

// ── Tablero ─────────────────────────────────────────────────────────────────

export type DashboardData = {
  today: string;
  reservasHoy: number;
  ingresosHoy: number;
  lanesFree: number;
  lanesOccupied: number;
  lanesBlocked: number;
  venueOpenNow: boolean;
  proximas: AdminReservation[];
  pendientesLlegada: AdminReservation[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const s = getSettings();
  const now = nowInBogota();
  const today = now.ymd;
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("reservations")
    .select(COLS)
    .eq("reservation_date", today);
  if (error) throw new Error(`getDashboardData: ${error.message}`);
  const all = (data as Row[]).map(map);

  const active = all.filter((r) => ACTIVE.includes(r.status));
  const confirmed = all.filter((r) => r.status === "confirmed");

  const ingresosHoy = confirmed.reduce((sum, r) => sum + r.amountDeposit, 0);

  // Pistas ocupadas/bloqueadas/ libres AHORA mismo.
  const slotNow = currentSlotIndex(today, now);
  let lanesOccupied = 0;
  let lanesBlocked = 0;
  if (slotNow !== null) {
    const occLanes = new Set<number>();
    for (const r of active) {
      if (overlaps(slotNow, 1, r.startSlot, r.turns)) occLanes.add(r.laneId);
    }
    const { data: blocks } = await db
      .from("blocks")
      .select("lane_id, start_slot, turns")
      .eq("block_date", today);
    const blkLanes = new Set<number>();
    for (const b of (blocks ?? []) as { lane_id: number; start_slot: number; turns: number }[]) {
      if (overlaps(slotNow, 1, b.start_slot, b.turns)) blkLanes.add(b.lane_id);
    }
    for (const l of blkLanes) occLanes.delete(l);
    lanesOccupied = occLanes.size;
    lanesBlocked = blkLanes.size;
  }
  const lanesFree = Math.max(0, s.venue.laneCount - lanesOccupied - lanesBlocked);

  // Próximas: reservas activas de hoy que aún no empiezan, por hora.
  const slotRef = slotNow ?? -1;
  const proximas = active
    .filter((r) => r.startSlot >= slotRef)
    .sort((a, b) => a.startSlot - b.startSlot)
    .slice(0, 8);

  // Pendientes de llegada: confirmadas de hoy que no han marcado llegada.
  const pendientesLlegada = confirmed
    .filter((r) => r.opStatus === "pendiente_llegada")
    .sort((a, b) => a.startSlot - b.startSlot);

  return {
    today,
    reservasHoy: active.length,
    ingresosHoy,
    lanesFree,
    lanesOccupied,
    lanesBlocked,
    venueOpenNow: slotNow !== null,
    proximas,
    pendientesLlegada,
  };
}

// ── Mapa de pistas ────────────────────────────────────────────────────────────

export type LaneMapCellStatus = "free" | "held" | "booked" | "blocked";

export type LaneMapCell = {
  laneId: number;
  status: LaneMapCellStatus;
  reservation?: {
    id: string;
    name: string;
    players: number;
    status: ReservationStatus;
    opStatus: OpStatus;
    reference: string;
  };
  block?: { reason: string | null };
};

export async function getLaneMap(
  date: string,
  startSlot: number,
  turns: number,
): Promise<LaneMapCell[]> {
  const s = getSettings();
  const db = supabaseAdmin();

  const [{ data: resData, error: e1 }, { data: blkData, error: e2 }] = await Promise.all([
    db.from("reservations").select(COLS).eq("reservation_date", date).in("status", ACTIVE),
    db.from("blocks").select("lane_id, start_slot, turns, reason").eq("block_date", date),
  ]);
  if (e1) throw new Error(`getLaneMap reservations: ${e1.message}`);
  if (e2) throw new Error(`getLaneMap blocks: ${e2.message}`);

  const reservations = (resData as Row[]).map(map);
  const blocks = (blkData ?? []) as {
    lane_id: number;
    start_slot: number;
    turns: number;
    reason: string | null;
  }[];

  const cells: LaneMapCell[] = [];
  for (let laneId = 1; laneId <= s.venue.laneCount; laneId += 1) {
    const block = blocks.find(
      (b) => b.lane_id === laneId && overlaps(startSlot, turns, b.start_slot, b.turns),
    );
    if (block) {
      cells.push({ laneId, status: "blocked", block: { reason: block.reason } });
      continue;
    }

    const hit = reservations.find(
      (r) => r.laneId === laneId && overlaps(startSlot, turns, r.startSlot, r.turns),
    );
    if (!hit) {
      cells.push({ laneId, status: "free" });
      continue;
    }
    cells.push({
      laneId,
      status: hit.status === "confirmed" ? "booked" : "held",
      reservation: {
        id: hit.id,
        name: hit.customer?.name ?? "—",
        players: hit.players,
        status: hit.status,
        opStatus: hit.opStatus,
        reference: hit.reference,
      },
    });
  }
  return cells;
}

// ── Listado de reservas ────────────────────────────────────────────────────────

export type ReservationFilters = {
  from?: string;
  to?: string;
  laneId?: number;
  status?: ReservationStatus;
  q?: string;
};

export async function listReservations(
  filters: ReservationFilters = {},
): Promise<AdminReservation[]> {
  const db = supabaseAdmin();
  let query = db.from("reservations").select(COLS);

  if (filters.from) query = query.gte("reservation_date", filters.from);
  if (filters.to) query = query.lte("reservation_date", filters.to);
  if (typeof filters.laneId === "number") query = query.eq("lane_id", filters.laneId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q && filters.q.trim()) {
    query = query.ilike("customer->>name", `%${filters.q.trim()}%`);
  }

  const { data, error } = await query
    .order("reservation_date", { ascending: true })
    .order("start_slot", { ascending: true })
    .limit(500);
  if (error) throw new Error(`listReservations: ${error.message}`);
  return (data as Row[]).map(map);
}

export type AdminBlock = {
  id: string;
  laneId: number;
  date: string;
  startSlot: number;
  turns: number;
  reason: string | null;
};

/** Bloqueos (mantenimiento/evento) de un día. */
export async function listBlocks(date: string): Promise<AdminBlock[]> {
  const { data, error } = await supabaseAdmin()
    .from("blocks")
    .select("id, lane_id, block_date, start_slot, turns, reason")
    .eq("block_date", date)
    .order("lane_id", { ascending: true });
  if (error) throw new Error(`listBlocks: ${error.message}`);
  return (
    (data ?? []) as {
      id: string;
      lane_id: number;
      block_date: string;
      start_slot: number;
      turns: number;
      reason: string | null;
    }[]
  ).map((b) => ({
    id: b.id,
    laneId: b.lane_id,
    date: b.block_date,
    startSlot: b.start_slot,
    turns: b.turns,
    reason: b.reason,
  }));
}

export async function getReservationById(id: string): Promise<AdminReservation | null> {
  const { data, error } = await supabaseAdmin()
    .from("reservations")
    .select(COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getReservationById: ${error.message}`);
  return data ? map(data as Row) : null;
}

// ── Reportes ──────────────────────────────────────────────────────────────────

export type ReportDay = {
  date: string;
  confirmadas: number;
  canceladas: number;
  ingresos: number; // suma de anticipos confirmados
};

export type ReportData = {
  from: string;
  to: string;
  days: ReportDay[];
  totalConfirmadas: number;
  totalCanceladas: number;
  totalIngresos: number;
  detail: AdminReservation[];
};

export async function getReportData(from: string, to: string): Promise<ReportData> {
  const detail = await listReservations({ from, to });

  const byDay = new Map<string, ReportDay>();
  for (const r of detail) {
    const d =
      byDay.get(r.date) ??
      { date: r.date, confirmadas: 0, canceladas: 0, ingresos: 0 };
    if (r.status === "confirmed") {
      d.confirmadas += 1;
      d.ingresos += r.amountDeposit;
    } else if (r.status === "cancelled") {
      d.canceladas += 1;
    }
    byDay.set(r.date, d);
  }

  const days = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
  return {
    from,
    to,
    days,
    totalConfirmadas: days.reduce((s, d) => s + d.confirmadas, 0),
    totalCanceladas: days.reduce((s, d) => s + d.canceladas, 0),
    totalIngresos: days.reduce((s, d) => s + d.ingresos, 0),
    detail,
  };
}
