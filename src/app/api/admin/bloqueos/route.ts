/**
 * POST /api/admin/bloqueos   { laneId, date, startSlot, turns, reason }
 * Bloquea una pista (mantenimiento / evento privado): deja de estar disponible
 * en la web y se ve "bloqueada" en el panel. No se puede bloquear una franja que
 * ya tiene una reserva activa (primero hay que cancelarla).
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSettings } from "@/lib/reservations/settings";
import { generateSlots } from "@/lib/reservations/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    laneId?: number;
    date?: string;
    startSlot?: number;
    turns?: number;
    reason?: string;
  };
  const { laneId, date, startSlot, turns, reason } = body;
  const s = getSettings();

  if (
    typeof laneId !== "number" ||
    typeof date !== "string" ||
    typeof startSlot !== "number" ||
    typeof turns !== "number"
  ) {
    return NextResponse.json({ ok: false, error: "Faltan datos del bloqueo." }, { status: 400 });
  }
  if (laneId < 1 || laneId > s.venue.laneCount)
    return NextResponse.json({ ok: false, error: "Pista inválida." }, { status: 400 });
  if (turns < 1)
    return NextResponse.json({ ok: false, error: "Duración inválida." }, { status: 400 });

  const slots = generateSlots(date);
  if (slots.length === 0)
    return NextResponse.json({ ok: false, error: "El local está cerrado ese día." }, { status: 400 });
  if (startSlot < 0 || startSlot + turns > slots.length)
    return NextResponse.json({ ok: false, error: "La franja excede el horario." }, { status: 400 });

  const db = supabaseAdmin();

  // No bloquear si hay una reserva activa que ocupa franjas en ese rango.
  const { data: occupied } = await db
    .from("reservation_slots")
    .select("slot_index")
    .eq("lane_id", laneId)
    .eq("slot_date", date)
    .gte("slot_index", startSlot)
    .lt("slot_index", startSlot + turns);
  if (occupied && occupied.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Esa pista tiene una reserva activa en ese horario. Cancélala primero." },
      { status: 409 },
    );
  }

  const { data: inserted, error } = await db
    .from("blocks")
    .insert({ lane_id: laneId, block_date: date, start_slot: startSlot, turns, reason: reason || null })
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await logAudit(auth.ctx, {
    action: "bloquear",
    targetType: "block",
    targetId: inserted.id,
    details: { laneId, date, startSlot, turns, reason: reason || null },
  });

  return NextResponse.json({ ok: true, id: inserted.id });
}
