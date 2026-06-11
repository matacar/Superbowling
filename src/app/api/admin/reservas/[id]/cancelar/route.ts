/**
 * POST /api/admin/reservas/[id]/cancelar   { reembolso?: boolean, motivo?: string }
 * Cancela la reserva y LIBERA la pista (release_reservation → borra sus franjas).
 * Marcar reembolso del anticipo es una acción sensible: solo rol admin. El
 * reembolso en sí se gestiona por fuera (Wompi en vivo llega después); aquí
 * queda registrado en la auditoría según la política acordada.
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { reembolso = false, motivo = "" } = await req.json().catch(() => ({}));

  // Marcar reembolso es solo de administrador.
  if (reembolso && auth.ctx.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Solo un administrador puede marcar reembolso." },
      { status: 403 },
    );
  }

  const db = supabaseAdmin();
  const { data: row, error: e0 } = await db
    .from("reservations")
    .select("reference, status")
    .eq("id", id)
    .maybeSingle();
  if (e0) return NextResponse.json({ ok: false, error: e0.message }, { status: 500 });
  if (!row) return NextResponse.json({ ok: false, error: "Reserva no encontrada." }, { status: 404 });

  const { data: res, error } = await db.rpc("release_reservation", {
    p_reference: row.reference,
    p_reason: "cancelled",
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!(res as { ok: boolean }).ok) {
    return NextResponse.json({ ok: false, error: "No se pudo cancelar." }, { status: 409 });
  }

  await logAudit(auth.ctx, {
    action: reembolso ? "cancelar_con_reembolso" : "cancelar",
    targetType: "reservation",
    targetId: id,
    details: { reference: row.reference, reembolso, motivo },
  });

  return NextResponse.json({ ok: true });
}
