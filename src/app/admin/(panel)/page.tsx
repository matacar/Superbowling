/**
 * Tablero (placeholder de F-B). Confirma que el panel autenticado lee la base
 * real: muestra unos conteos en vivo. El tablero completo (mapa, próximas,
 * ingresos del día, pendientes de llegada) se construye en F-C.
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import { nowInBogota } from "@/lib/reservations/time";

export const dynamic = "force-dynamic";

async function counts() {
  const db = supabaseAdmin();
  const today = nowInBogota().ymd;

  const [total, confirmadas, hoy] = await Promise.all([
    db.from("reservations").select("*", { count: "exact", head: true }),
    db
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
    db
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("reservation_date", today),
  ]);

  return {
    total: total.count ?? 0,
    confirmadas: confirmadas.count ?? 0,
    hoy: hoy.count ?? 0,
    today,
  };
}

export default async function DashboardPage() {
  const c = await counts();

  const cards = [
    { label: "Reservas hoy", value: c.hoy },
    { label: "Confirmadas (total)", value: c.confirmadas },
    { label: "Reservas (total)", value: c.total },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-cream">Tablero</h1>
        <p className="text-sm text-muted">Resumen de hoy ({c.today})</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-brand border border-line bg-surface p-5"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-cream">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-brand border border-line bg-surface-2 p-5">
        <p className="text-sm text-cream">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-lane-free align-middle" />
          Conectado a la base real (Supabase). Acceso protegido y validado por
          rol en el servidor.
        </p>
        <p className="mt-2 text-xs text-muted">
          Las secciones marcadas “pronto” en el menú se construyen en las fases
          siguientes: mapa de pistas en vivo, reservas, pagos y reportes.
        </p>
      </div>
    </div>
  );
}
