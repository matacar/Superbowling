import { NextResponse } from "next/server";
import { getStore } from "@/lib/reservations/store";
import type { CreateHoldInput } from "@/lib/reservations/types";

/**
 * POST /api/reservar/demo-carrera   { date, startSlot, turns }
 *
 * DEMOSTRACIÓN del anti-doble-reserva: lanza DOS intentos de hold SIMULTÁNEOS
 * (Promise.all) sobre la PRIMERA pista libre, simulando dos clientes pagando
 * a la vez. Solo uno obtiene la pista; el otro recibe `lane_taken`.
 *
 * En memoria, la garantía la da que createHold no tiene `await` entre el
 * chequeo y el alta (Node es de un hilo → se serializan).
 * En Postgres, la da el constraint UNIQUE(lane_id, slot_date, slot_index).
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { date, startSlot, turns } = await req.json();
  if (typeof date !== "string" || typeof startSlot !== "number" || typeof turns !== "number") {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  const store = getStore();

  // Buscamos la primera pista libre para esa franja.
  const lanes = await store.getAvailability(date, startSlot, turns);
  const free = lanes.find((l) => l.status === "free");
  if (!free) {
    return NextResponse.json({ error: "No hay pistas libres en esa franja para la demo." }, { status: 409 });
  }

  const base: Omit<CreateHoldInput, "customer"> = {
    laneId: free.laneId,
    date,
    startSlot,
    turns,
    players: 4,
  };
  const mk = (name: string): CreateHoldInput => ({
    ...base,
    customer: { name, doc: "0", phone: "—", email: `${name}@demo.co` },
  });

  // Dos pagos "al mismo tiempo" sobre la MISMA pista/franja.
  const [a, b] = await Promise.all([
    store.createHold(mk("Cliente A")),
    store.createHold(mk("Cliente B")),
  ]);

  const summarize = (who: string, r: Awaited<ReturnType<typeof store.createHold>>) =>
    r.ok
      ? { cliente: who, resultado: "ganó la pista", reference: r.reservation.reference }
      : { cliente: who, resultado: "rechazado", motivo: r.reason, mensaje: r.message };

  return NextResponse.json({
    laneId: free.laneId,
    date,
    startSlot,
    turns,
    intentos: [summarize("Cliente A", a), summarize("Cliente B", b)],
    explicacion:
      "Ambos intentaron la misma pista y franja a la vez. La operación de alta es atómica: solo uno crea el hold, el otro recibe lane_taken. En producción lo impone el UNIQUE de Postgres, no la aplicación.",
  });
}
