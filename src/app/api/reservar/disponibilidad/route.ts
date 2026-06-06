import { NextResponse } from "next/server";
import { getMemoryStore } from "@/lib/reservations/store/memory";
import { priceForTurns } from "@/lib/reservations/settings";

/**
 * GET /api/reservar/disponibilidad?date=YYYY-MM-DD&startSlot=N&turns=M
 * Estado de las 16 pistas para esa fecha/franja/duración (free | held | booked)
 * + precio total y anticipo para esa duración. Alimenta la maqueta de pistas.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const date = params.get("date");
  const startSlot = Number(params.get("startSlot"));
  const turns = Number(params.get("turns"));

  if (!date || Number.isNaN(startSlot) || Number.isNaN(turns)) {
    return NextResponse.json(
      { error: "Parámetros inválidos (date, startSlot, turns)." },
      { status: 400 },
    );
  }

  const store = getMemoryStore();
  const lanes = await store.getAvailability(date, startSlot, turns);
  const price = priceForTurns(turns);

  return NextResponse.json({ lanes, price });
}
