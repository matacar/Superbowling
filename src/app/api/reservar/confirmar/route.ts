import { NextResponse } from "next/server";
import { getMemoryStore } from "@/lib/reservations/store/memory";

/**
 * POST /api/reservar/confirmar   { reference }
 *
 * SIMULACIÓN del webhook de Wompi con un pago APPROVED (modo sandbox).
 * En producción NO existe esta ruta: la confirmación llega por webhook firmado
 * de Wompi, que es la única fuente de verdad. Aquí sirve para validar el flujo
 * completo en el demo: hold → pago → confirmada (la pista pasa a "booked").
 *
 * confirm() es idempotente y revalida disponibilidad: si el hold expiró y otro
 * confirmó esa franja, devuelve conflicto para gestionar el reembolso.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { reference } = await req.json();
  if (typeof reference !== "string") {
    return NextResponse.json({ error: "Falta reference." }, { status: 400 });
  }

  const store = getMemoryStore();
  await store.markPendingPayment(reference);

  const fakeTxId = `WOMPI-SANDBOX-${reference}`;
  const result = await store.confirm(reference, fakeTxId);

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    status: result.reservation.status,
    reference,
    wompiTransactionId: result.reservation.wompiTransactionId,
  });
}
