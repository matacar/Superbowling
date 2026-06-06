/** Tipos de dominio del sistema de reservas. */

export type ReservationStatus =
  | "hold" // bloqueo temporal mientras el cliente paga (expira)
  | "pending_payment" // pago iniciado, esperando confirmación de Wompi
  | "confirmed" // anticipo aprobado → pista bloqueada en firme
  | "expired" // el hold venció sin pago → pista liberada
  | "cancelled"; // cancelada/reembolsada → pista liberada

/** Estados que OCUPAN una pista (impiden que otro reserve la misma franja). */
export const ACTIVE_STATUSES: ReservationStatus[] = [
  "hold",
  "pending_payment",
  "confirmed",
];

export type Customer = {
  name: string;
  doc: string; // documento/cédula
  phone: string;
  email: string;
};

export type Reservation = {
  id: string;
  laneId: number; // número de pista 1..N
  date: string; // "YYYY-MM-DD"
  startSlot: number; // índice de franja de inicio
  turns: number; // cuántas franjas consecutivas ocupa
  players: number;
  customer: Customer;
  status: ReservationStatus;
  holdExpiresAt: string | null; // ISO; cuándo expira el bloqueo temporal
  amountTotal: number; // COP
  amountDeposit: number; // COP (anticipo)
  currency: "COP";
  reference: string; // referencia única para Wompi
  wompiTransactionId: string | null;
  createdAt: string; // ISO
};

/** Estado de una pista para una fecha/franja concreta (para la maqueta). */
export type LaneCellStatus = "free" | "held" | "booked" | "blocked";

export type LaneAvailability = {
  laneId: number;
  status: LaneCellStatus;
};

/** Una franja horaria seleccionable. */
export type Slot = {
  index: number;
  label: string; // "6:00 p. m."
  startMinutes: number; // minutos desde medianoche
  /** Disponible para reservar (respeta anticipación mínima si es hoy). */
  selectable: boolean;
};

export type CreateHoldInput = {
  laneId: number;
  date: string;
  startSlot: number;
  turns: number;
  players: number;
  customer: Customer;
};

export type CreateHoldResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: "lane_taken" | "invalid" | "closed"; message: string };
