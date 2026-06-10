/**
 * Tablero — vista rápida del día: reservas de hoy, pistas libres/ocupadas ahora,
 * próximas reservas, ingresos por anticipos y pendientes de llegada.
 */

import Link from "next/link";
import { getDashboardData, slotLabelFor, timeRangeFor } from "@/lib/admin/queries";
import { formatCOP } from "@/lib/reservations/settings";
import { OP_CHIP, OP_LABEL, STATUS_CHIP, STATUS_LABEL } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await getDashboardData();

  const cards = [
    { label: "Reservas hoy", value: String(d.reservasHoy) },
    { label: "Anticipos del día", value: formatCOP(d.ingresosHoy) },
    {
      label: "Pistas libres ahora",
      value: d.venueOpenNow ? `${d.lanesFree} / 16` : "Cerrado",
    },
    { label: "Pendientes de llegada", value: String(d.pendientesLlegada.length) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">Tablero</h1>
          <p className="text-sm text-muted">Resumen de hoy · {d.today}</p>
        </div>
        <Link
          href="/admin/pistas"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition hover:bg-accent-2"
        >
          Ver mapa de pistas
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-brand border border-line bg-surface p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cream">{c.value}</p>
          </div>
        ))}
      </div>

      {d.venueOpenNow && (
        <div className="flex flex-wrap gap-4 rounded-brand border border-line bg-surface-2 px-5 py-3 text-sm">
          <Estado color="bg-lane-free" label={`${d.lanesFree} libres`} />
          <Estado color="bg-cream/40" label={`${d.lanesOccupied} ocupadas`} />
          <Estado color="bg-red-400" label={`${d.lanesBlocked} bloqueadas`} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Próximas reservas" emptyText="No hay próximas reservas hoy.">
          {d.proximas.map((r) => (
            <Link
              key={r.id}
              href={`/admin/reservas/${r.id}`}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-cream">{r.customer?.name ?? "—"}</p>
                <p className="text-xs text-muted">
                  Pista {r.laneId} · {slotLabelFor(r.date, r.startSlot)} · {r.players} jug.
                </p>
              </div>
              <Chip className={STATUS_CHIP[r.status]}>{STATUS_LABEL[r.status]}</Chip>
            </Link>
          ))}
        </Panel>

        <Panel
          title="Pendientes de llegada"
          emptyText="Nadie pendiente de llegada."
        >
          {d.pendientesLlegada.map((r) => (
            <Link
              key={r.id}
              href={`/admin/reservas/${r.id}`}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-cream">{r.customer?.name ?? "—"}</p>
                <p className="text-xs text-muted">
                  Pista {r.laneId} · {timeRangeFor(r.date, r.startSlot, r.turns)}
                </p>
              </div>
              <Chip className={OP_CHIP[r.opStatus]}>{OP_LABEL[r.opStatus]}</Chip>
            </Link>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Estado({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-muted">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Panel({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.flat().filter(Boolean).length === 0;
  return (
    <section className="rounded-brand border border-line bg-surface p-4">
      <h2 className="mb-2 px-1 text-sm font-medium text-cream">{title}</h2>
      {isEmpty ? (
        <p className="px-3 py-6 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="divide-y divide-line/60">{children}</div>
      )}
    </section>
  );
}
