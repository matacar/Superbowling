/**
 * DELETE /api/admin/bloqueos/[id]
 * Quita un bloqueo: la pista vuelve a quedar disponible (web y panel).
 */

import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await supabaseAdmin().from("blocks").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await logAudit(auth.ctx, {
    action: "desbloquear",
    targetType: "block",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
