/**
 * Cliente de Supabase para el NAVEGADOR (componentes cliente del panel).
 *
 * Usa la clave pública (anon). Sirve para iniciar sesión y, más adelante, para
 * las suscripciones realtime del panel. La sesión se guarda en cookies que el
 * middleware y el servidor leen (vía @supabase/ssr).
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
