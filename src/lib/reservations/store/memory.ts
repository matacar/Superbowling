/**
 * Store EN MEMORIA — para el demo local con disponibilidad simulada.
 *
 * Reproduce las mismas reglas que la versión Postgres:
 *  - bloqueo temporal (hold) con expiración,
 *  - prevención de doble reserva sobre (pista + fecha + franja),
 *  - confirmación idempotente vía webhook.
 *
 * Node ejecuta JS en un solo hilo, así que el chequeo-e-inserción de
 * `createHold` es atómico (no hay `await` entre la verificación y el alta):
 * dos peticiones simultáneas se serializan y la segunda recibe `lane_taken`.
 * En producción esa garantía la da el constraint UNIQUE de Postgres
 * (ver supabase/migrations/0001_init.sql).
 */

import {
  getSettings,
  priceForTurns,
} from "../settings";
import { generateSlots } from "../time";
import {
  ACTIVE_STATUSES,
  type CreateHoldInput,
  type CreateHoldResult,
  type LaneAvailability,
  type LaneCellStatus,
  type Reservation,
} from "../types";
import type { ReservationStore } from "./types";

function overlaps(aStart: number, aTurns: number, bStart: number, bTurns: number) {
  return aStart < bStart + bTurns && bStart < aStart + aTurns;
}

let refCounter = 0;
function makeReference(): string {
  refCounter += 1;
  return `SB-${Date.now().toString(36).toUpperCase()}-${refCounter
    .toString()
    .padStart(3, "0")}`;
}

class MemoryStore implements ReservationStore {
  private items = new Map<string, Reservation>();
  private seq = 0;

  constructor() {
    this.seed();
  }

  private nextId() {
    this.seq += 1;
    return `r_${this.seq}`;
  }

  /** Reservas activas (no expiradas/canceladas) tras barrer vencidos. */
  private activeFor(date: string): Reservation[] {
    this.sweepExpiredSync();
    return [...this.items.values()].filter(
      (r) => r.date === date && ACTIVE_STATUSES.includes(r.status),
    );
  }

  private conflict(
    laneId: number,
    date: string,
    startSlot: number,
    turns: number,
    excludeId?: string,
  ): Reservation | null {
    for (const r of this.activeFor(date)) {
      if (r.laneId !== laneId) continue;
      if (excludeId && r.id === excludeId) continue;
      if (overlaps(startSlot, turns, r.startSlot, r.turns)) return r;
    }
    return null;
  }

  private sweepExpiredSync(): number {
    const now = Date.now();
    let n = 0;
    for (const r of this.items.values()) {
      if (
        (r.status === "hold" || r.status === "pending_payment") &&
        r.holdExpiresAt &&
        new Date(r.holdExpiresAt).getTime() < now
      ) {
        r.status = "expired";
        r.holdExpiresAt = null;
        n += 1;
      }
    }
    return n;
  }

  async sweepExpired(): Promise<number> {
    return this.sweepExpiredSync();
  }

  async getAvailability(
    date: string,
    startSlot: number,
    turns: number,
  ): Promise<LaneAvailability[]> {
    const s = getSettings();
    const active = this.activeFor(date);
    const result: LaneAvailability[] = [];
    for (let laneId = 1; laneId <= s.venue.laneCount; laneId += 1) {
      let status: LaneCellStatus = "free";
      for (const r of active) {
        if (r.laneId !== laneId) continue;
        if (!overlaps(startSlot, turns, r.startSlot, r.turns)) continue;
        status = r.status === "hold" ? "held" : "booked";
        if (status === "booked") break; // booked tiene prioridad visual
      }
      result.push({ laneId, status });
    }
    return result;
  }

  async createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
    const s = getSettings();
    const { laneId, date, startSlot, turns, players } = input;

    // — Validaciones —
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

    // — Chequeo + alta ATÓMICOS (sin await en medio) —
    if (this.conflict(laneId, date, startSlot, turns))
      return {
        ok: false,
        reason: "lane_taken",
        message: "Esa pista ya fue tomada para ese horario.",
      };

    const { total, deposit } = priceForTurns(turns, s);
    const now = Date.now();
    const reservation: Reservation = {
      id: this.nextId(),
      laneId,
      date,
      startSlot,
      turns,
      players,
      customer: input.customer,
      status: "hold",
      holdExpiresAt: new Date(now + s.booking.holdMinutes * 60_000).toISOString(),
      amountTotal: total,
      amountDeposit: deposit,
      currency: "COP",
      reference: makeReference(),
      wompiTransactionId: null,
      createdAt: new Date(now).toISOString(),
    };
    this.items.set(reservation.id, reservation);
    return { ok: true, reservation };
  }

  async getReservation(id: string) {
    return this.items.get(id) ?? null;
  }

  async getByReference(reference: string) {
    return (
      [...this.items.values()].find((r) => r.reference === reference) ?? null
    );
  }

  async markPendingPayment(reference: string) {
    const r = await this.getByReference(reference);
    if (!r) return null;
    if (r.status === "hold") r.status = "pending_payment";
    return r;
  }

  async confirm(reference: string, wompiTransactionId: string) {
    const r = await this.getByReference(reference);
    if (!r) return { ok: false as const, reason: "not_found" };

    // Idempotencia: si ya está confirmada, no hacemos nada.
    if (r.status === "confirmed") {
      return { ok: true as const, reservation: r };
    }

    // Caso límite: el hold expiró antes de llegar el webhook. Revalidamos que
    // nadie más haya confirmado esa franja en el intermedio.
    const clash = this.conflict(r.laneId, r.date, r.startSlot, r.turns, r.id);
    if (clash && clash.status === "confirmed") {
      r.status = "cancelled"; // requiere reembolso del anticipo
      r.wompiTransactionId = wompiTransactionId;
      return { ok: false as const, reason: "conflict_refund_required" };
    }

    r.status = "confirmed";
    r.holdExpiresAt = null;
    r.wompiTransactionId = wompiTransactionId;
    return { ok: true as const, reservation: r };
  }

  async release(reference: string, reason: "expired" | "cancelled") {
    const r = await this.getByReference(reference);
    if (!r) return null;
    if (r.status === "confirmed" && reason === "expired") return r; // no expira lo confirmado
    r.status = reason;
    r.holdExpiresAt = null;
    return r;
  }

  // — Datos simulados para que la maqueta muestre disponibilidad variada —
  private seed() {
    const s = getSettings();
    const dates = nextOpenDates(4);
    const fakeCustomer = {
      name: "Reserva demo",
      doc: "0",
      phone: "—",
      email: "demo@superbowling.co",
    };
    dates.forEach((date, di) => {
      const slots = generateSlots(date);
      if (slots.length === 0) return;
      // patrón determinista por fecha
      const seedNum = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
      const occupy = (laneId: number, startSlot: number, turns: number, hold: boolean) => {
        if (startSlot + turns > slots.length) return;
        const { total, deposit } = priceForTurns(turns, s);
        const id = this.nextId();
        this.items.set(id, {
          id,
          laneId,
          date,
          startSlot,
          turns,
          players: 4,
          customer: fakeCustomer,
          status: hold ? "hold" : "confirmed",
          holdExpiresAt: hold
            ? new Date(Date.now() + 9 * 60_000).toISOString()
            : null,
          amountTotal: total,
          amountDeposit: deposit,
          currency: "COP",
          reference: `SEED-${date}-${laneId}`,
          wompiTransactionId: hold ? null : "seed",
          createdAt: new Date().toISOString(),
        });
      };
      const mid = Math.floor(slots.length / 2);
      occupy(2 + (di % 3), mid, 1, false);
      occupy(5 + (seedNum % 4), mid, 2, false);
      occupy(9, Math.max(0, mid - 1), 1, false);
      occupy(12 + (di % 2), mid, 1, true); // un hold (bloqueo temporal)
      occupy(16, mid, 1, false);
    });
  }
}

/** Próximas N fechas abiertas (para sembrar el demo). */
function nextOpenDates(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < 30 && out.length < n; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (generateSlots(ymd).length > 0) out.push(ymd);
  }
  return out;
}

// Singleton que sobrevive al hot-reload de desarrollo.
const g = globalThis as unknown as { __sbMemoryStore?: MemoryStore };
export function getMemoryStore(): MemoryStore {
  if (!g.__sbMemoryStore) g.__sbMemoryStore = new MemoryStore();
  return g.__sbMemoryStore;
}
