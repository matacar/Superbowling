/**
 * Store SUPABASE (Postgres) — implementación de producción de `ReservationStore`.
 *
 * Misma interfaz que el store en memoria, pero la garantía anti-doble-reserva
 * la da el motor de la base: el constraint UNIQUE(lane_id, slot_date, slot_index)
 * de `supabase/migrations/0001_init.sql`. Toda la lógica transaccional vive en
 * las funciones SQL `create_hold`, `confirm_reservation`, `release_reservation`,
 * `expire_holds` y `lane_availability` — aquí solo las invocamos y mapeamos.
 *
 * Es la MISMA base que lee el panel admin y la web pública (fuente única de
 * verdad): una reserva pagada en la web queda aquí y el panel solo la muestra.
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getSettings,
  priceForTurns,
} from "../settings";
import { generateSlots } from "../time";
import {
  type CreateHoldInput,
  type CreateHoldResult,
  type LaneAvailability,
  type LaneCellStatus,
  type Reservation,
} from "../types";
import type { ReservationStore } from "./types";

/** Fila tal cual vive en la tabla `reservations`. */
type ReservationRow = {
  id: string;
  lane_id: number;
  reservation_date: string;
  start_slot: number;
  turns: number;
  players: number;
  customer: Reservation["customer"];
  status: Reservation["status"];
  hold_expires_at: string | null;
  amount_total: number | string;
  amount_deposit: number | string;
  currency: "COP";
  reference: string;
  wompi_transaction_id: string | null;
  created_at: string;
};

function rowToReservation(r: ReservationRow): Reservation {
  return {
    id: r.id,
    laneId: r.lane_id,
    date: r.reservation_date,
    startSlot: r.start_slot,
    turns: r.turns,
    players: r.players,
    customer: r.customer,
    status: r.status,
    holdExpiresAt: r.hold_expires_at,
    amountTotal: Number(r.amount_total),
    amountDeposit: Number(r.amount_deposit),
    currency: r.currency,
    reference: r.reference,
    wompiTransactionId: r.wompi_transaction_id,
    createdAt: r.created_at,
  };
}

function makeReference(): string {
  // Referencia única para Wompi. La unicidad final la garantiza el UNIQUE de
  // la columna `reference`; este formato solo la hace legible.
  const rand = Math.floor(performance.now() * 1000) % 1_000_000;
  return `SB-${Date.now().toString(36).toUpperCase()}-${rand
    .toString()
    .padStart(6, "0")}`;
}

class SupabaseStore implements ReservationStore {
  private get db() {
    return supabaseAdmin();
  }

  async getAvailability(
    date: string,
    startSlot: number,
    turns: number,
  ): Promise<LaneAvailability[]> {
    const s = getSettings();
    const { data, error } = await this.db.rpc("lane_availability", {
      p_date: date,
      p_start: startSlot,
      p_turns: turns,
    });
    if (error) throw new Error(`lane_availability: ${error.message}`);

    // La función solo devuelve las pistas ocupadas/bloqueadas; el resto, libres.
    const byLane = new Map<number, LaneCellStatus>();
    for (const row of (data ?? []) as { lane_id: number; status: string }[]) {
      byLane.set(row.lane_id, row.status as LaneCellStatus);
    }

    const result: LaneAvailability[] = [];
    for (let laneId = 1; laneId <= s.venue.laneCount; laneId += 1) {
      result.push({ laneId, status: byLane.get(laneId) ?? "free" });
    }
    return result;
  }

  async createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
    const s = getSettings();
    const { laneId, date, startSlot, turns, players, customer } = input;

    // — Validaciones (mismas reglas que el store en memoria) —
    if (laneId < 1 || laneId > s.venue.laneCount)
      return { ok: false, reason: "invalid", message: "Pista inválida." };
    if (turns < s.turn.minTurns || turns > s.turn.maxTurns)
      return { ok: false, reason: "invalid", message: "Duración inválida." };
    if (players < 1 || players > s.venue.maxPlayersPerLane)
      return { ok: false, reason: "invalid", message: "Número de jugadores inválido." };

    const slots = generateSlots(date);
    if (slots.length === 0)
      return { ok: false, reason: "closed", message: "Cerrado ese día." };
    const slot = slots.find((sl) => sl.index === startSlot);
    if (!slot || !slot.selectable)
      return { ok: false, reason: "invalid", message: "Franja no disponible." };
    if (startSlot + turns > slots.length)
      return { ok: false, reason: "invalid", message: "La duración excede el horario." };

    const { total, deposit } = priceForTurns(turns, s);
    const reference = makeReference();

    // El alta atómica (reserva + franjas) vive en la función SQL. Si la franja
    // ya está tomada, el UNIQUE dispara y la función devuelve lane_taken.
    const { data, error } = await this.db.rpc("create_hold", {
      p_lane_id: laneId,
      p_date: date,
      p_start_slot: startSlot,
      p_turns: turns,
      p_players: players,
      p_customer: customer,
      p_amount_total: total,
      p_amount_deposit: deposit,
      p_reference: reference,
      p_hold_minutes: s.booking.holdMinutes,
    });
    if (error) throw new Error(`create_hold: ${error.message}`);

    const res = data as { ok: boolean; reason?: string };
    if (!res.ok) {
      if (res.reason === "lane_taken")
        return {
          ok: false,
          reason: "lane_taken",
          message: "Esa pista ya fue tomada para ese horario.",
        };
      return { ok: false, reason: "invalid", message: "No se pudo crear la reserva." };
    }

    const reservation = await this.getByReference(reference);
    if (!reservation)
      return { ok: false, reason: "invalid", message: "No se pudo leer la reserva creada." };
    return { ok: true, reservation };
  }

  async getReservation(id: string): Promise<Reservation | null> {
    const { data, error } = await this.db
      .from("reservations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`getReservation: ${error.message}`);
    return data ? rowToReservation(data as ReservationRow) : null;
  }

  async getByReference(reference: string): Promise<Reservation | null> {
    const { data, error } = await this.db
      .from("reservations")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw new Error(`getByReference: ${error.message}`);
    return data ? rowToReservation(data as ReservationRow) : null;
  }

  async markPendingPayment(reference: string): Promise<Reservation | null> {
    // Solo pasa de hold → pending_payment (no toca confirmadas).
    const { error } = await this.db
      .from("reservations")
      .update({ status: "pending_payment" })
      .eq("reference", reference)
      .eq("status", "hold");
    if (error) throw new Error(`markPendingPayment: ${error.message}`);
    return this.getByReference(reference);
  }

  async confirm(reference: string, wompiTransactionId: string) {
    const { data, error } = await this.db.rpc("confirm_reservation", {
      p_reference: reference,
      p_tx_id: wompiTransactionId,
    });
    if (error) throw new Error(`confirm_reservation: ${error.message}`);

    const res = data as { ok: boolean; reason?: string };
    if (!res.ok) return { ok: false as const, reason: res.reason ?? "unknown" };

    const reservation = await this.getByReference(reference);
    if (!reservation) return { ok: false as const, reason: "not_found" };
    return { ok: true as const, reservation };
  }

  async release(reference: string, reason: "expired" | "cancelled") {
    const { error } = await this.db.rpc("release_reservation", {
      p_reference: reference,
      p_reason: reason,
    });
    if (error) throw new Error(`release_reservation: ${error.message}`);
    return this.getByReference(reference);
  }

  async sweepExpired(): Promise<number> {
    const { data, error } = await this.db.rpc("expire_holds");
    if (error) throw new Error(`expire_holds: ${error.message}`);
    return typeof data === "number" ? data : 0;
  }
}

let store: SupabaseStore | null = null;
export function getSupabaseStore(): SupabaseStore {
  if (!store) store = new SupabaseStore();
  return store;
}
