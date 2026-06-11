"use client";

/**
 * Bloquear / desbloquear pistas por mantenimiento o evento. Bloquea una pista
 * libre para la franja seleccionada y lista los bloqueos del día para quitarlos.
 * Lo que se bloquea deja de estar disponible en la web y se ve "bloqueada".
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type Block = {
  id: string;
  laneId: number;
  range: string;
  reason: string | null;
};

export default function BlockControls({
  date,
  startSlot,
  turns,
  slotLabel,
  freeLanes,
  blocks,
}: {
  date: string;
  startSlot: number;
  turns: number;
  slotLabel: string;
  freeLanes: number[];
  blocks: Block[];
}) {
  const router = useRouter();
  const [laneId, setLaneId] = useState<number | "">(freeLanes[0] ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function bloquear() {
    if (laneId === "") return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/bloqueos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ laneId, date, startSlot, turns, reason }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "No se pudo bloquear.");
      return;
    }
    setReason("");
    router.refresh();
  }

  async function quitar(id: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/bloqueos/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "No se pudo quitar el bloqueo.");
      return;
    }
    router.refresh();
  }

  const field = "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <section className="space-y-4 rounded-brand border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-accent">Bloqueos (mantenimiento / evento)</h2>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Pista libre
          <select
            className={field}
            value={laneId}
            onChange={(e) => setLaneId(e.target.value ? Number(e.target.value) : "")}
          >
            {freeLanes.length === 0 && <option value="">— sin pistas libres —</option>}
            {freeLanes.map((l) => (
              <option key={l} value={l}>
                Pista {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Motivo
          <input
            className={`${field} w-full`}
            placeholder="Mantenimiento, evento privado…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={busy || laneId === ""}
          onClick={bloquear}
          className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          Bloquear {slotLabel}
        </button>
      </div>

      {blocks.length > 0 && (
        <div className="divide-y divide-line/60 border-t border-line pt-2">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-cream">
                Pista {b.laneId} · <span className="text-muted">{b.range}</span>
                {b.reason ? <span className="text-muted"> — {b.reason}</span> : null}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => quitar(b.id)}
                className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-cream disabled:opacity-50"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
