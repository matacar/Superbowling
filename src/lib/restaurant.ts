/**
 * HORARIO DEL RESTAURANTE — franjas de reserva de mesa.
 * ─────────────────────────────────────────────────────
 * Las franjas seleccionables (cada 30 min) se derivan de aquí, NO se
 * hardcodean en el formulario. Editar este objeto cambia las franjas.
 *
 * [POR CONFIRMAR] Horario propio del restaurante. Base provisional = horario
 * del lugar (la bolera). El restaurante podría abrir antes (almuerzo) o cerrar
 * la cocina antes; ajustar cuando el cliente confirme el horario exacto.
 */

import { type DayKey, dayKeyFromDate } from "@/lib/reservations/settings";

/** Horario por día. `null` = cerrado. Horas "HH:MM" (24h); "24:00" = medianoche. */
export type OpenHours = { open: string; close: string } | null;

export const RESTAURANT_HOURS: Record<DayKey, OpenHours> = {
  mon: { open: "15:00", close: "23:59" }, // [POR CONFIRMAR]
  tue: { open: "15:00", close: "23:59" }, // [POR CONFIRMAR]
  wed: { open: "15:00", close: "23:59" }, // [POR CONFIRMAR]
  thu: { open: "15:00", close: "23:59" }, // [POR CONFIRMAR]
  fri: { open: "15:00", close: "23:59" }, // [POR CONFIRMAR]
  sat: { open: "12:00", close: "24:00" }, // [POR CONFIRMAR]
  sun: null, // [POR CONFIRMAR — domingo pendiente]
};

/** Paso entre franjas, en minutos. */
export const SLOT_STEP_MIN = 30;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Franjas de 30 min ("19:00", "19:30"…) para una fecha ISO "YYYY-MM-DD".
 * Devuelve [] si ese día está cerrado o la fecha es inválida.
 * La última franja queda un paso antes del cierre.
 */
export function tableSlotsForDate(dateISO: string): string[] {
  if (!dateISO) return [];
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const hours = RESTAURANT_HOURS[dayKeyFromDate(date)];
  if (!hours) return [];

  const start = toMinutes(hours.open);
  const end = toMinutes(hours.close === "24:00" ? "24:00" : hours.close);

  const slots: string[] = [];
  for (let t = start; t <= end - SLOT_STEP_MIN; t += SLOT_STEP_MIN) {
    slots.push(fromMinutes(t));
  }
  return slots;
}
