/**
 * Selector del repositorio de reservas (fuente única de verdad).
 *
 * - Con credenciales de Supabase → store Postgres (producción): la web pública
 *   y el panel admin leen/escriben la MISMA base.
 * - Sin credenciales → store en memoria (demo local).
 *
 * Todas las rutas API y el panel consumen `getStore()`, nunca un store concreto.
 */

import { hasSupabaseEnv } from "@/lib/supabase/server";
import { getMemoryStore } from "./memory";
import { getSupabaseStore } from "./supabase";
import type { ReservationStore } from "./types";

export function getStore(): ReservationStore {
  return hasSupabaseEnv() ? getSupabaseStore() : getMemoryStore();
}

/** True si estamos sobre la base real (útil para el panel y los avisos). */
export function isLiveBackend(): boolean {
  return hasSupabaseEnv();
}
