/**
 * CONFIGURACIÓN OPERATIVA DEL SISTEMA DE RESERVAS
 * ───────────────────────────────────────────────
 * Fuente única de verdad de TODOS los datos operativos. Nada de esto está
 * hardcodeado en componentes ni en la lógica: todo se lee desde aquí.
 *
 * En la Fase 4 (panel admin) esta configuración pasará a una tabla `settings`
 * en la base de datos y `getSettings()` la leerá desde allí. Por eso todo el
 * código consume `getSettings()` y NUNCA el objeto directamente.
 *
 * Los valores [POR CONFIRMAR] son placeholders configurables a la espera de
 * datos del cliente.
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Horario de un día. `null` = cerrado. Horas en "HH:MM" (24h). "24:00" = medianoche del día siguiente. */
export type DayHours = { open: string; close: string } | null;

export type Settings = {
  venue: {
    /** Número de pistas. */
    laneCount: number;
    /** Máximo de jugadores por pista. */
    maxPlayersPerLane: number; // [POR CONFIRMAR]
  };
  turn: {
    /** Duración de un turno/franja en minutos. */
    durationMinutes: number; // [POR CONFIRMAR]
    /** Mínimo y máximo de turnos que se pueden reservar de corrido. */
    minTurns: number;
    maxTurns: number;
  };
  pricing: {
    currency: "COP";
    /** Precio por pista por turno. */
    pricePerTurn: number; // [POR CONFIRMAR]
  };
  /** ANTICIPO (separación): lo que el cliente paga online para confirmar. */
  deposit: {
    mode: "percent" | "fixed";
    /** Si mode=percent, porcentaje (0-100). Si mode=fixed, monto en COP. */
    value: number; // [POR CONFIRMAR]
  };
  booking: {
    /** Horas mínimas de anticipación para reservar. */
    minAdvanceHours: number; // [POR CONFIRMAR]
    /** Minutos que dura el bloqueo temporal mientras el cliente paga. */
    holdMinutes: number;
    /** Cuántos días hacia adelante se pueden reservar. */
    horizonDays: number;
  };
  /** Horario de atención por día de la semana. */
  hours: Record<DayKey, DayHours>;
};

/**
 * Valores actuales. Horario confirmado por el cliente (2026-06-06):
 *  - Lunes a viernes: 3:00 p. m. – 11:59 p. m.
 *  - Sábados:         12:00 m. – 12:00 a. m. (medianoche)
 *  - Domingos:        [POR CONFIRMAR] → por ahora cerrado.
 */
const SETTINGS: Settings = {
  venue: {
    laneCount: 16,
    maxPlayersPerLane: 6, // [POR CONFIRMAR — placeholder]
  },
  turn: {
    durationMinutes: 60, // [POR CONFIRMAR — placeholder]
    minTurns: 1,
    maxTurns: 3,
  },
  pricing: {
    currency: "COP",
    pricePerTurn: 70000, // [POR CONFIRMAR — placeholder configurable]
  },
  deposit: {
    mode: "percent",
    value: 50, // [POR CONFIRMAR — placeholder: 50% de anticipo]
  },
  booking: {
    minAdvanceHours: 2, // [POR CONFIRMAR — placeholder]
    holdMinutes: 10,
    horizonDays: 21,
  },
  hours: {
    mon: { open: "15:00", close: "23:59" },
    tue: { open: "15:00", close: "23:59" },
    wed: { open: "15:00", close: "23:59" },
    thu: { open: "15:00", close: "23:59" },
    fri: { open: "15:00", close: "23:59" },
    sat: { open: "12:00", close: "24:00" },
    sun: null, // [POR CONFIRMAR — horario de domingos pendiente]
  },
};

/**
 * Punto único de acceso a la configuración.
 * (En F4 leerá de la base de datos; la firma se mantiene estable.)
 */
export function getSettings(): Settings {
  return SETTINGS;
}

const DAY_INDEX_TO_KEY: DayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/** Convierte el getDay() de una fecha (0=domingo) a la clave de día. */
export function dayKeyFromDate(date: Date): DayKey {
  return DAY_INDEX_TO_KEY[date.getDay()];
}

/** Calcula el monto del anticipo dado el total. */
export function calcDeposit(total: number, s: Settings = getSettings()): number {
  const raw =
    s.deposit.mode === "percent"
      ? (total * s.deposit.value) / 100
      : s.deposit.value;
  // Redondeo a la centena de peso más cercana (COP no usa centavos).
  return Math.max(0, Math.round(raw / 100) * 100);
}

/** Precio total y anticipo para una cantidad de turnos. */
export function priceForTurns(
  turns: number,
  s: Settings = getSettings(),
): { total: number; deposit: number } {
  const total = s.pricing.pricePerTurn * Math.max(1, turns);
  return { total, deposit: calcDeposit(total, s) };
}

/** Subconjunto de la configuración seguro para enviar al navegador. */
export type PublicConfig = {
  laneCount: number;
  maxPlayersPerLane: number;
  durationMinutes: number;
  minTurns: number;
  maxTurns: number;
  holdMinutes: number;
  currency: "COP";
  pricePerTurn: number;
  deposit: { mode: "percent" | "fixed"; value: number };
};

/** Configuración pública que consume el asistente de reserva en el cliente. */
export function publicConfig(s: Settings = getSettings()): PublicConfig {
  return {
    laneCount: s.venue.laneCount,
    maxPlayersPerLane: s.venue.maxPlayersPerLane,
    durationMinutes: s.turn.durationMinutes,
    minTurns: s.turn.minTurns,
    maxTurns: s.turn.maxTurns,
    holdMinutes: s.booking.holdMinutes,
    currency: s.pricing.currency,
    pricePerTurn: s.pricing.pricePerTurn,
    deposit: { mode: s.deposit.mode, value: s.deposit.value },
  };
}

/** Formatea un monto en pesos colombianos. */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}
