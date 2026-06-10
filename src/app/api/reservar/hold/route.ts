import { NextResponse } from "next/server";
import { getStore } from "@/lib/reservations/store";
import type { CreateHoldInput } from "@/lib/reservations/types";

/**
 * POST /api/reservar/hold
 * Crea el bloqueo temporal (hold) de una pista de forma atómica.
 * Aquí se previene la doble reserva: si la franja ya está tomada por una
 * reserva activa, devuelve 409 lane_taken. En producción esa garantía la da
 * el constraint UNIQUE de Postgres (ver supabase/migrations/0001_init.sql).
 *
 * El hold expira en `holdMinutes`; tras un pago aprobado (webhook de Wompi)
 * se confirma, o se libera ante DECLINED/expiración.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Partial<CreateHoldInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid", message: "JSON inválido." }, { status: 400 });
  }

  const { laneId, date, startSlot, turns, players, customer } = body;
  if (
    typeof laneId !== "number" ||
    typeof date !== "string" ||
    typeof startSlot !== "number" ||
    typeof turns !== "number" ||
    typeof players !== "number" ||
    !customer
  ) {
    return NextResponse.json(
      { ok: false, reason: "invalid", message: "Faltan datos de la reserva." },
      { status: 400 },
    );
  }

  const store = getStore();
  const result = await store.createHold({
    laneId,
    date,
    startSlot,
    turns,
    players,
    customer,
  });

  if (!result.ok) {
    const status = result.reason === "lane_taken" ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  // Solo devolvemos lo que el cliente necesita (no toda la reserva).
  const r = result.reservation;
  return NextResponse.json({
    ok: true,
    reservation: {
      reference: r.reference,
      laneId: r.laneId,
      date: r.date,
      startSlot: r.startSlot,
      turns: r.turns,
      players: r.players,
      amountTotal: r.amountTotal,
      amountDeposit: r.amountDeposit,
      currency: r.currency,
      holdExpiresAt: r.holdExpiresAt,
    },
  });
}
