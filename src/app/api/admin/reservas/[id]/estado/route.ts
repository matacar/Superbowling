/**
 * POST /api/admin/reservas/[id]/estado   { opStatus }
 * Marca el estado operativo de la reserva: llegó / no se presentó / completada
 * (o de vuelta a pendiente). No afecta el estado del pago ni libera la pista.
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID = ["pendiente_llegada", "llego", "no_show", "completada"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { opStatus } = await req.json().catch(() => ({}));
  if (!VALID.includes(opStatus)) {
    return NextResponse.json({ ok: false, error: "Estado inválido." }, { status: 400 });
  }

  const { error } = await supabaseAdmin()
    .from("reservations")
    .update({ op_status: opStatus })
    .eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await logAudit(auth.ctx, {
    action: "marcar_estado",
    targetType: "reservation",
    targetId: id,
    details: { opStatus },
  });

  return NextResponse.json({ ok: true });
}
