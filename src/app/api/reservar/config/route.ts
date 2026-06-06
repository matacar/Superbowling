import { NextResponse } from "next/server";
import { publicConfig } from "@/lib/reservations/settings";
import { bookableDates } from "@/lib/reservations/time";

/**
 * GET /api/reservar/config
 * Datos que el asistente de reserva necesita al cargar: fechas reservables
 * (con marca de cerrado) y la configuración pública (precios, duración, holds).
 * Todo proviene de getSettings() → nada hardcodeado.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    config: publicConfig(),
    dates: bookableDates(),
  });
}
