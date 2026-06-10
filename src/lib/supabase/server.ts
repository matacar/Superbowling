/**
 * Clientes de Supabase para el SERVIDOR.
 *
 * - `supabaseAdmin()` usa la SERVICE ROLE KEY → omite RLS. SOLO se puede usar
 *   en código de servidor (route handlers, server actions, server components).
 *   NUNCA debe importarse en componentes cliente: expondría el secreto.
 *   El control de acceso del panel se hace ANTES (middleware valida sesión+rol);
 *   este cliente confía en que ya se autorizó la operación.
 *
 * - `hasSupabaseEnv()` indica si hay credenciales configuradas. Sin ellas, el
 *   sistema cae al store en memoria (demo local).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let adminClient: SupabaseClient | null = null;

/** Cliente con service role (omite RLS). Solo servidor. */
export function supabaseAdmin(): SupabaseClient {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return adminClient;
}
