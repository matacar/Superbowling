/**
 * POST /api/admin/reservas/manual
 * Crea una reserva MANUAL (walk-in) desde el panel: ya confirmada, sin pago en
 * línea. Mantiene la misma protección anti-doble-reserva (UNIQUE de Postgres):
 * usa las funciones create_hold + confirm_reservation. A diferencia de la web,
 * el personal puede reservar la franja actual (no exige anticipación mínima),
 * pero sí valida pista, duración, jugadores y que el local esté abierto.
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSettings, priceForTurns } from "@/lib/reservations/settings";
import { generateSlots } from "@/lib/reservations/time";
import type { Customer } from "@/lib/reservations/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: {
    laneId?: number;
    date?: string;
    startSlot?: number;
    turns?: number;
    players?: number;
    customer?: Customer;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const { laneId, date, startSlot, turns, players, customer } = body;
  const s = getSettings();

  // — Validaciones (sin exigir anticipación mínima) —
  if (
    typeof laneId !== "number" ||
    typeof date !== "string" ||
    typeof startSlot !== "number" ||
    typeof turns !== "number" ||
    typeof players !== "number" ||
    !customer?.name
  ) {
    return NextResponse.json(
      { ok: false, error: "Faltan datos de la reserva." },
      { status: 400 },
    );
  }
  if (laneId < 1 || laneId > s.venue.laneCount)
    return NextResponse.json({ ok: false, error: "Pista inválida." }, { status: 400 });
  if (turns < s.turn.minTurns || turns > s.turn.maxTurns)
    return NextResponse.json({ ok: false, error: "Duración inválida." }, { status: 400 });
  if (players < 1 || players > s.venue.maxPlayersPerLane)
    return NextResponse.json({ ok: false, error: "Número de jugadores inválido." }, { status: 400 });

  const slots = generateSlots(date);
  if (slots.length === 0)
    return NextResponse.json({ ok: false, error: "El local está cerrado ese día." }, { status: 400 });
  if (startSlot < 0 || startSlot + turns > slots.length)
    return NextResponse.json({ ok: false, error: "La franja excede el horario." }, { status: 400 });

  const db = supabaseAdmin();

  // No permitir reservar una pista bloqueada por mantenimiento/evento.
  const { data: laneBlocks } = await db
    .from("blocks")
    .select("start_slot, turns")
    .eq("lane_id", laneId)
    .eq("block_date", date);
  const blocked = (laneBlocks ?? []).some(
    (b) => b.start_slot < startSlot + turns && startSlot < b.start_slot + b.turns,
  );
  if (blocked) {
    return NextResponse.json(
      { ok: false, error: "Esa pista está bloqueada en ese horario." },
      { status: 409 },
    );
  }

  const { total, deposit } = priceForTurns(turns, s);
  const reference = `SB-MAN-${Date.now().toString(36).toUpperCase()}`;

  // 1) Hold atómico (el UNIQUE impide doble reserva).
  const { data: hold, error: e1 } = await db.rpc("create_hold", {
    p_lane_id: laneId,
    p_date: date,
    p_start_slot: startSlot,
    p_turns: turns,
    p_players: players,
    p_customer: customer,
    p_amount_total: total,
    p_amount_deposit: deposit,
    p_reference: reference,
    p_hold_minutes: s.booking.holdMinutes,
  });
  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
  if (!(hold as { ok: boolean }).ok) {
    return NextResponse.json(
      { ok: false, error: "Esa pista ya está reservada en ese horario." },
      { status: 409 },
    );
  }

  // 2) Confirmar de inmediato (reserva manual, sin pago en línea).
  const { data: conf, error: e2 } = await db.rpc("confirm_reservation", {
    p_reference: reference,
    p_tx_id: `MANUAL-${auth.ctx.email}`,
  });
  if (e2) return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
  if (!(conf as { ok: boolean }).ok) {
    return NextResponse.json(
      { ok: false, error: "No se pudo confirmar la reserva manual." },
      { status: 409 },
    );
  }

  const { data: row } = await db
    .from("reservations")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();

  await logAudit(auth.ctx, {
    action: "crear_manual",
    targetType: "reservation",
    targetId: row?.id ?? reference,
    details: { laneId, date, startSlot, turns, players, reference },
  });

  return NextResponse.json({ ok: true, id: row?.id, reference });
}
