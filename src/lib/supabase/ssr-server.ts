/**
 * Cliente de Supabase para el SERVIDOR ligado a las cookies de la petición
 * (server components, server actions y route handlers).
 *
 * Lee/escribe la sesión del usuario en cookies vía @supabase/ssr. Es el cliente
 * que representa al USUARIO autenticado (clave anon + su sesión), distinto del
 * `supabaseAdmin()` (service role) que omite RLS.
 *
 * En server components las cookies son de solo lectura: el `setAll` puede
 * lanzar y se ignora a propósito (el middleware ya refresca la sesión).
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Invocado desde un server component (cookies de solo lectura).
            // El refresco de sesión lo hace el middleware.
          }
        },
      },
    },
  );
}
