import type {
  CreateHoldInput,
  CreateHoldResult,
  LaneAvailability,
  Reservation,
} from "../types";

/**
 * Contrato del repositorio de reservas.
 *
 * Dos implementaciones:
 *  - memory  → demo local con disponibilidad simulada (sin credenciales).
 *  - supabase → producción (Postgres con restricción única pista+fecha+franja
 *               y holds con expiración; el constraint garantiza no-doble-reserva
 *               incluso con pagos simultáneos).
 *
 * El webhook de Wompi es la fuente de verdad: `confirm()` se llama al recibir
 * un pago APPROVED y `release()` ante DECLINED/VOIDED/expiración.
 */
export interface ReservationStore {
  /** Disponibilidad de las N pistas para una fecha + franja + duración. */
  getAvailability(
    date: string,
    startSlot: number,
    turns: number,
  ): Promise<LaneAvailability[]>;

  /**
   * Crea un bloqueo temporal (hold) de forma ATÓMICA. Si la franja de esa
   * pista ya está ocupada por una reserva activa, devuelve `lane_taken`.
   * Es el punto donde se previene la doble reserva.
   */
  createHold(input: CreateHoldInput): Promise<CreateHoldResult>;

  getReservation(id: string): Promise<Reservation | null>;
  getByReference(reference: string): Promise<Reservation | null>;

  /** Marca el hold como "pago iniciado" (esperando webhook). */
  markPendingPayment(reference: string): Promise<Reservation | null>;

  /**
   * Confirma una reserva (anticipo aprobado). Idempotente.
   * Revalida disponibilidad: si la pista fue tomada por otra reserva confirmada
   * (caso límite tras expiración), devuelve conflicto para gestionar reembolso.
   */
  confirm(
    reference: string,
    wompiTransactionId: string,
  ): Promise<{ ok: true; reservation: Reservation } | { ok: false; reason: string }>;

  /** Libera la pista (pago fallido, expiración o cancelación). Idempotente. */
  release(
    reference: string,
    reason: "expired" | "cancelled",
  ): Promise<Reservation | null>;

  /** Marca como expirados los holds vencidos. Devuelve cuántos liberó. */
  sweepExpired(): Promise<number>;
}
