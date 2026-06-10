/**
 * Etiquetas y colores CONSISTENTES de estado para todo el panel
 * (mismas palabras y colores en el mapa, las listas y el detalle).
 */

import type { ReservationStatus } from "@/lib/reservations/types";
import type { OpStatus, LaneMapCellStatus } from "@/lib/admin/queries";

/** Estado del PAGO de la reserva (lo que importa para la operación/caja). */
export const STATUS_LABEL: Record<ReservationStatus, string> = {
  hold: "En proceso",
  pending_payment: "Pago iniciado",
  confirmed: "Pagada",
  expired: "Expirada",
  cancelled: "Cancelada",
};

/** Clases Tailwind para el chip de estado de pago. */
export const STATUS_CHIP: Record<ReservationStatus, string> = {
  hold: "bg-lane-held/15 text-lane-held",
  pending_payment: "bg-lane-held/15 text-lane-held",
  confirmed: "bg-lane-free/15 text-lane-free",
  expired: "bg-line text-muted",
  cancelled: "bg-red-500/15 text-red-400",
};

/** Estado OPERATIVO (llegada del cliente). */
export const OP_LABEL: Record<OpStatus, string> = {
  pendiente_llegada: "Pendiente",
  llego: "Llegó",
  no_show: "No llegó",
  completada: "Completada",
};

export const OP_CHIP: Record<OpStatus, string> = {
  pendiente_llegada: "bg-line text-muted",
  llego: "bg-lane-free/15 text-lane-free",
  no_show: "bg-red-500/15 text-red-400",
  completada: "bg-accent/15 text-accent",
};

/** Estado de una celda del mapa de pistas. */
export const LANE_LABEL: Record<LaneMapCellStatus, string> = {
  free: "Libre",
  held: "En proceso",
  booked: "Pagada",
  blocked: "Bloqueada",
};

/** Color de fondo de la celda del mapa (consistente con los tokens F2). */
export const LANE_CELL: Record<LaneMapCellStatus, string> = {
  free: "border-lane-free/40 bg-lane-free/10 text-lane-free",
  held: "border-lane-held/40 bg-lane-held/10 text-lane-held",
  booked: "border-cream/20 bg-surface-2 text-cream",
  blocked: "border-red-500/30 bg-red-500/10 text-red-400",
};
