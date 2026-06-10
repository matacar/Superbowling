/**
 * Autorización del panel — SIEMPRE en el servidor.
 *
 * `getAdminContext()` resuelve quién es el usuario actual y su rol:
 *   - unauthenticated → no hay sesión válida.
 *   - forbidden       → hay sesión, pero el email NO está en `admin_users`.
 *   - ok              → usuario autorizado, con su rol (admin | recepcion).
 *
 * El rol se consulta con la SERVICE ROLE (omite RLS) sobre `admin_users`, que es
 * la lista blanca del equipo. Ocultar botones en la interfaz NO es seguridad:
 * la verdad está aquí, y cada route handler sensible llama `requireAdmin()`.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseEnv } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr-server";

export type AdminRole = "admin" | "recepcion";

export type AdminContext = {
  userId: string;
  email: string;
  role: AdminRole;
};

export type AdminContextResult =
  | { status: "ok"; ctx: AdminContext }
  | { status: "unauthenticated" }
  | { status: "forbidden"; email: string }
  | { status: "unconfigured" };

export async function getAdminContext(): Promise<AdminContextResult> {
  if (!hasSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { status: "unauthenticated" };

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (error) throw new Error(`getAdminContext: ${error.message}`);
  if (!data) return { status: "forbidden", email: user.email };

  return {
    status: "ok",
    ctx: { userId: user.id, email: user.email, role: data.role as AdminRole },
  };
}

/**
 * Para route handlers de /api/admin. Devuelve el contexto autorizado o una
 * respuesta de error lista para retornar. Si se pide `minRole: "admin"`, el rol
 * `recepcion` queda rechazado (403).
 */
export async function requireAdmin(opts?: {
  minRole?: AdminRole;
}): Promise<
  { ok: true; ctx: AdminContext } | { ok: false; response: NextResponse }
> {
  const result = await getAdminContext();

  if (result.status === "ok") {
    if (opts?.minRole === "admin" && result.ctx.role !== "admin") {
      return {
        ok: false,
        response: NextResponse.json(
          { ok: false, error: "Requiere rol de administrador." },
          { status: 403 },
        ),
      };
    }
    return { ok: true, ctx: result.ctx };
  }

  const status = result.status === "forbidden" ? 403 : 401;
  const error =
    result.status === "forbidden"
      ? "Tu cuenta no tiene acceso al panel."
      : result.status === "unconfigured"
        ? "Backend no configurado."
        : "No autenticado.";
  return { ok: false, response: NextResponse.json({ ok: false, error }, { status }) };
}

/** Registra una acción sensible en `audit_log` (no interrumpe si falla). */
export async function logAudit(
  ctx: AdminContext,
  entry: {
    action: string;
    targetType?: string;
    targetId?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabaseAdmin().from("audit_log").insert({
      actor_email: ctx.email,
      actor_role: ctx.role,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      details: entry.details ?? null,
    });
  } catch {
    // La auditoría nunca debe tumbar la operación principal.
  }
}
