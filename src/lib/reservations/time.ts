/**
 * Utilidades de tiempo y generación de franjas (slots).
 * Todo se deriva de la configuración operativa (settings.ts).
 *
 * Nota de zona horaria: el negocio opera en Colombia (America/Bogotá, UTC-5,
 * sin horario de verano). Las fechas se manejan como "YYYY-MM-DD" y las horas
 * como minutos desde medianoche en hora local de Colombia.
 */

import {
  dayKeyFromDate,
  getSettings,
  type Settings,
  type DayKey,
} from "./settings";
import type { Slot } from "./types";

export const BOGOTA_TZ = "America/Bogota";

/** "HH:MM" → minutos desde medianoche. "24:00" → 1440. */
export function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

/** Minutos desde medianoche → etiqueta "6:00 p. m." */
export function minutesToLabel(mins: number): string {
  const total = mins % 1440;
  let h = Math.floor(total / 60);
  const m = total % 60;
  const period = h < 12 || h === 24 ? "a. m." : "p. m.";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/** "YYYY-MM-DD" → Date a medianoche local (para conocer el día de la semana). */
export function dateFromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" (en hora local de Colombia). */
export function ymdInBogota(date: Date): string {
  // en-CA da el formato YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** "Ahora" en Colombia, como { ymd, minutes } (minutos desde medianoche). */
export function nowInBogota(now: Date = new Date()): {
  ymd: string;
  minutes: number;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOGOTA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { ymd: ymdInBogota(now), minutes: h * 60 + m };
}

export function dayHoursFor(ymd: string, s: Settings = getSettings()) {
  const key: DayKey = dayKeyFromDate(dateFromYMD(ymd));
  return s.hours[key];
}

/**
 * Genera las franjas seleccionables para una fecha.
 * Una franja es un posible inicio de turno; debe caber al menos 1 turno
 * completo antes del cierre. Marca `selectable=false` las que ya pasaron o
 * no respetan la anticipación mínima (si la fecha es hoy).
 */
export function generateSlots(
  ymd: string,
  opts?: { now?: Date },
  s: Settings = getSettings(),
): Slot[] {
  const hours = dayHoursFor(ymd, s);
  if (!hours) return []; // cerrado ese día

  const open = parseHM(hours.open);
  const close = parseHM(hours.close);
  const step = s.turn.durationMinutes;

  const now = nowInBogota(opts?.now);
  const isToday = now.ymd === ymd;
  const minStartIfToday = now.minutes + s.booking.minAdvanceHours * 60;

  const slots: Slot[] = [];
  let index = 0;
  for (let start = open; start + step <= close; start += step) {
    const selectable = !isToday || start >= minStartIfToday;
    slots.push({
      index,
      label: minutesToLabel(start),
      startMinutes: start,
      selectable,
    });
    index += 1;
  }
  return slots;
}

/** Lista de fechas reservables (desde hoy hasta el horizonte configurado). */
export function bookableDates(
  opts?: { now?: Date },
  s: Settings = getSettings(),
): { ymd: string; closed: boolean; weekdayLabel: string; dayNum: string }[] {
  const now = nowInBogota(opts?.now);
  const base = dateFromYMD(now.ymd);
  const out = [];
  for (let i = 0; i < s.booking.horizonDays; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hours = dayHoursFor(ymd, s);
    out.push({
      ymd,
      closed: !hours,
      weekdayLabel: new Intl.DateTimeFormat("es-CO", { weekday: "short" }).format(d),
      dayNum: new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(d),
    });
  }
  return out;
}
