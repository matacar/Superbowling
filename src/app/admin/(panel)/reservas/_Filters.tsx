"use client";

/**
 * Filtros del listado de reservas: rango de fechas, pista, estado y búsqueda
 * por nombre. Atajos "Hoy" y "Semana". Aplica actualizando la URL.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/lib/reservations/types";
import { STATUS_LABEL } from "@/lib/admin/labels";

const STATUSES: ReservationStatus[] = [
  "confirmed",
  "hold",
  "pending_payment",
  "cancelled",
  "expired",
];

export default function Filters({
  from,
  to,
  laneId,
  status,
  q,
  laneCount,
  todayRange,
  weekRange,
}: {
  from: string;
  to: string;
  laneId: string;
  status: string;
  q: string;
  laneCount: number;
  todayRange: { from: string; to: string };
  weekRange: { from: string; to: string };
}) {
  const router = useRouter();
  const [f, setF] = useState({ from, to, laneId, status, q });

  function apply(next = f) {
    const params = new URLSearchParams();
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.laneId) params.set("lane", next.laneId);
    if (next.status) params.set("status", next.status);
    if (next.q.trim()) params.set("q", next.q.trim());
    router.push(`/admin/reservas?${params.toString()}`);
  }

  const field = "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="space-y-3 rounded-brand border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Desde
          <input
            type="date"
            value={f.from}
            onChange={(e) => setF({ ...f, from: e.target.value })}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Hasta
          <input
            type="date"
            value={f.to}
            onChange={(e) => setF({ ...f, to: e.target.value })}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Pista
          <select
            value={f.laneId}
            onChange={(e) => setF({ ...f, laneId: e.target.value })}
            className={field}
          >
            <option value="">Todas</option>
            {Array.from({ length: laneCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Pista {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Estado
          <select
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value })}
            className={field}
          >
            <option value="">Todos</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABEL[st]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Buscar por nombre
          <input
            type="search"
            placeholder="Nombre del cliente…"
            value={f.q}
            onChange={(e) => setF({ ...f, q: e.target.value })}
            className={`${field} w-full`}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition hover:bg-accent-2"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={() => {
            const next = { ...f, ...todayRange };
            setF(next);
            apply(next);
          }}
          className="rounded-lg border border-line px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-cream"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            const next = { ...f, ...weekRange };
            setF(next);
            apply(next);
          }}
          className="rounded-lg border border-line px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-cream"
        >
          Semana
        </button>
      </div>
    </form>
  );
}
