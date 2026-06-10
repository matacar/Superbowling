"use client";

/**
 * Selectores de fecha / hora / duración del mapa de pistas. Al cambiar,
 * actualizan los parámetros de la URL y el servidor vuelve a renderizar el mapa.
 */

import { useRouter } from "next/navigation";

type Opt = { value: string; label: string };

export default function Controls({
  date,
  startSlot,
  turns,
  dateOptions,
  slotOptions,
  maxTurns,
}: {
  date: string;
  startSlot: number;
  turns: number;
  dateOptions: Opt[];
  slotOptions: Opt[];
  maxTurns: number;
}) {
  const router = useRouter();

  function go(next: { date?: string; startSlot?: number; turns?: number }) {
    const params = new URLSearchParams({
      date: next.date ?? date,
      slot: String(next.startSlot ?? startSlot),
      turns: String(next.turns ?? turns),
    });
    router.push(`/admin/pistas?${params.toString()}`);
  }

  const selectClass =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Día
        <select
          className={selectClass}
          value={date}
          onChange={(e) => go({ date: e.target.value, startSlot: 0 })}
        >
          {dateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Hora
        <select
          className={selectClass}
          value={startSlot}
          onChange={(e) => go({ startSlot: Number(e.target.value) })}
        >
          {slotOptions.length === 0 && <option value={0}>— cerrado —</option>}
          {slotOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Duración
        <select
          className={selectClass}
          value={turns}
          onChange={(e) => go({ turns: Number(e.target.value) })}
        >
          {Array.from({ length: maxTurns }, (_, i) => i + 1).map((t) => (
            <option key={t} value={t}>
              {t} turno{t > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
