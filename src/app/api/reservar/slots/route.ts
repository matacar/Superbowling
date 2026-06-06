import { NextResponse } from "next/server";
import { generateSlots } from "@/lib/reservations/time";

/**
 * GET /api/reservar/slots?date=YYYY-MM-DD
 * Franjas horarias seleccionables para una fecha (vacío = cerrado ese día).
 * Marca `selectable=false` las que ya pasaron o no cumplen la anticipación.
 */
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Falta el parámetro date." }, { status: 400 });
  }
  return NextResponse.json({ slots: generateSlots(date) });
}
