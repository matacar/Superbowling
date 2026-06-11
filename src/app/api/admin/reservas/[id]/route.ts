/**
 * PATCH /api/admin/reservas/[id]   { players?, customer? }
 * Edita datos puntuales de una reserva: número de jugadores y datos de contacto
 * del cliente. No cambia pista/fecha/franja (eso afectaría la disponibilidad y
 * se maneja cancelando y recreando, para no romper el anti-doble-reserva).
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSettings } from "@/lib/reservations/settings";
import type { Customer } from "@/lib/reservations/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    players?: number;
    customer?: Partial<Customer>;
  };

  const update: Record<string, unknown> = {};

  if (typeof body.players === "number") {
    const s = getSettings();
    if (body.players < 1 || body.players > s.venue.maxPlayersPerLane) {
      return NextResponse.json({ ok: false, error: "Número de jugadores inválido." }, { status: 400 });
    }
    update.players = body.players;
  }

  if (body.customer) {
    const db = supabaseAdmin();
    const { data: row } = await db
      .from("reservations")
      .select("customer")
      .eq("id", id)
      .maybeSingle();
    const current = (row?.customer ?? {}) as Customer;
    update.customer = {
      name: body.customer.name ?? current.name,
      doc: body.customer.doc ?? current.doc,
      phone: body.customer.phone ?? current.phone,
      email: body.customer.email ?? current.email,
    };
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "Nada para actualizar." }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from("reservations").update(update).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await logAudit(auth.ctx, {
    action: "editar",
    targetType: "reservation",
    targetId: id,
    details: update,
  });

  return NextResponse.json({ ok: true });
}
