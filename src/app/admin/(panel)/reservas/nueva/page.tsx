"use client";

/**
 * Crear reserva MANUAL (walk-in) desde el panel. Reutiliza los endpoints
 * públicos (config, slots, disponibilidad) para elegir día, hora, duración y
 * pista libre, y crea la reserva ya confirmada (sin pago en línea) vía
 * /api/admin/reservas/manual — con la misma protección anti-doble-reserva.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Slot = { index: number; label: string; selectable: boolean };
type DateOpt = { ymd: string; closed: boolean; weekdayLabel: string; dayNum: string };
type Lane = { laneId: number; status: "free" | "held" | "booked" | "blocked" };

function cop(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default function NuevaReservaPage() {
  const router = useRouter();
  const [dates, setDates] = useState<DateOpt[]>([]);
  const [cfg, setCfg] = useState<{ maxTurns: number; maxPlayersPerLane: number; pricePerTurn: number } | null>(null);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startSlot, setStartSlot] = useState(0);
  const [turns, setTurns] = useState(1);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [laneId, setLaneId] = useState<number | null>(null);

  const [players, setPlayers] = useState(2);
  const [customer, setCustomer] = useState({ name: "", doc: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config + fechas
  useEffect(() => {
    fetch("/api/reservar/config")
      .then((r) => r.json())
      .then((d) => {
        const open: DateOpt[] = d.dates.filter((x: DateOpt) => !x.closed);
        setDates(open);
        setCfg(d.config);
        if (open[0]) setDate(open[0].ymd);
      })
      .catch(() => setError("No se pudo cargar la configuración."));
  }, []);

  // Franjas del día
  useEffect(() => {
    if (!date) return;
    fetch(`/api/reservar/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? []);
        setStartSlot(0);
      });
  }, [date]);

  // Disponibilidad de pistas
  useEffect(() => {
    if (!date || slots.length === 0) return;
    fetch(`/api/reservar/disponibilidad?date=${date}&startSlot=${startSlot}&turns=${turns}`)
      .then((r) => r.json())
      .then((d) => {
        setLanes(d.lanes ?? []);
        setLaneId(null);
      });
  }, [date, startSlot, turns, slots.length]);

  async function crear() {
    if (!laneId) {
      setError("Elige una pista libre.");
      return;
    }
    if (!customer.name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/reservas/manual", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ laneId, date, startSlot, turns, players, customer }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "No se pudo crear la reserva.");
      return;
    }
    router.push(`/admin/reservas/${data.id}`);
    router.refresh();
  }

  const total = cfg ? cfg.pricePerTurn * turns : 0;
  const field = "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/reservas" className="text-sm text-muted hover:text-cream">
          ← Volver a reservas
        </Link>
        <h1 className="mt-2 font-display text-2xl tracking-wide text-cream">Nueva reserva manual</h1>
        <p className="text-sm text-muted">Para clientes que llegan sin reservar. Queda confirmada de inmediato.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-brand border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Día
            <select className={field} value={date} onChange={(e) => setDate(e.target.value)}>
              {dates.map((d) => (
                <option key={d.ymd} value={d.ymd}>
                  {d.weekdayLabel} {d.dayNum}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Hora
            <select className={field} value={startSlot} onChange={(e) => setStartSlot(Number(e.target.value))}>
              {slots.length === 0 && <option value={0}>— cerrado —</option>}
              {slots.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Duración
            <select className={field} value={turns} onChange={(e) => setTurns(Number(e.target.value))}>
              {Array.from({ length: cfg?.maxTurns ?? 1 }, (_, i) => i + 1).map((t) => (
                <option key={t} value={t}>
                  {t} turno{t > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Pistas */}
        <div>
          <p className="mb-2 text-xs text-muted">Pista (elige una libre)</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {lanes.map((l) => {
              const free = l.status === "free";
              const selected = laneId === l.laneId;
              return (
                <button
                  key={l.laneId}
                  type="button"
                  disabled={!free}
                  onClick={() => setLaneId(l.laneId)}
                  className={`rounded-lg border px-2 py-2 text-sm transition ${
                    selected
                      ? "border-accent bg-accent text-accent-ink"
                      : free
                        ? "border-lane-free/40 bg-lane-free/10 text-lane-free hover:brightness-125"
                        : "cursor-not-allowed border-line bg-surface-2 text-muted/40"
                  }`}
                >
                  {l.laneId}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cliente */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Jugadores
            <input
              type="number"
              min={1}
              max={cfg?.maxPlayersPerLane ?? 6}
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Nombre del cliente *
            <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Documento
            <input value={customer.doc} onChange={(e) => setCustomer({ ...customer, doc: e.target.value })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Teléfono
            <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted sm:col-span-2">
            Correo
            <input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className={field} />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <p className="text-sm text-muted">
            Total reserva: <span className="text-cream">{cop(total)}</span>
          </p>
          <button
            type="button"
            disabled={busy || !laneId}
            onClick={crear}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition hover:bg-accent-2 disabled:opacity-50"
          >
            {busy ? "Creando…" : "Crear reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
