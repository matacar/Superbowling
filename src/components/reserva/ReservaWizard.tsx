"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicConfig } from "@/lib/reservations/settings";
import type { LaneAvailability, LaneCellStatus, Slot } from "@/lib/reservations/types";

/** Formato local en pesos (evita acoplar el cliente a settings.ts). */
function cop(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

type BookableDate = {
  ymd: string;
  closed: boolean;
  weekdayLabel: string;
  dayNum: string;
};

type Price = { total: number; deposit: number };

type HeldReservation = {
  reference: string;
  laneId: number;
  date: string;
  startSlot: number;
  turns: number;
  players: number;
  amountTotal: number;
  amountDeposit: number;
  currency: string;
  holdExpiresAt: string | null;
};

const STEPS = ["Día", "Hora", "Jugadores", "Pista", "Datos", "Listo"] as const;

export default function ReservaWizard() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [dates, setDates] = useState<BookableDate[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startSlot, setStartSlot] = useState<number | null>(null);
  const [turns, setTurns] = useState(1);
  const [players, setPlayers] = useState(2);

  const [lanes, setLanes] = useState<LaneAvailability[]>([]);
  const [price, setPrice] = useState<Price | null>(null);
  const [loadingLanes, setLoadingLanes] = useState(false);
  const [laneId, setLaneId] = useState<number | null>(null);

  const [customer, setCustomer] = useState({ name: "", doc: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [held, setHeld] = useState<HeldReservation | null>(null);

  // ── Carga inicial: configuración + fechas ──
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/reservar/config");
        if (!res.ok) throw new Error("No se pudo cargar la configuración.");
        const data = await res.json();
        if (!active) return;
        setConfig(data.config);
        setDates(data.dates);
        setTurns(data.config.minTurns);
        setPlayers(Math.min(2, data.config.maxPlayersPerLane));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Error inesperado.");
      } finally {
        if (active) setLoadingConfig(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ── Cuántos turnos caben desde la franja elegida ──
  const maxTurnsHere = useMemo(() => {
    if (!config || startSlot === null) return config?.maxTurns ?? 1;
    return Math.min(config.maxTurns, slots.length - startSlot);
  }, [config, startSlot, slots.length]);

  // ── Cargar franjas al elegir fecha ──
  const loadSlots = useCallback(async (ymd: string) => {
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservar/slots?date=${ymd}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setError("No se pudieron cargar las franjas.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // ── Cargar disponibilidad de pistas ──
  const loadLanes = useCallback(async () => {
    if (date === null || startSlot === null) return;
    setLoadingLanes(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/reservar/disponibilidad?date=${date}&startSlot=${startSlot}&turns=${turns}`,
      );
      const data = await res.json();
      setLanes(data.lanes ?? []);
      setPrice(data.price ?? null);
    } catch {
      setError("No se pudo cargar la disponibilidad.");
    } finally {
      setLoadingLanes(false);
    }
  }, [date, startSlot, turns]);

  // Recargar disponibilidad cuando estamos en el paso de pistas (o cambia duración).
  useEffect(() => {
    if (step === 3) loadLanes();
  }, [step, loadLanes]);

  function chooseDate(d: BookableDate) {
    if (d.closed) return;
    setDate(d.ymd);
    setStartSlot(null);
    setSlots([]);
    setLaneId(null);
    setHeld(null);
    loadSlots(d.ymd);
    setStep(1);
  }

  function chooseSlot(s: Slot) {
    if (!s.selectable) return;
    setStartSlot(s.index);
    // Ajusta la duración si ya no cabe desde esta franja.
    const fit = config ? Math.min(config.maxTurns, slots.length - s.index) : 1;
    setTurns((t) => Math.max(1, Math.min(t, fit)));
    setLaneId(null);
  }

  async function submitHold() {
    if (laneId === null || date === null || startSlot === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservar/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ laneId, date, startSlot, turns, players, customer }),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.reason === "lane_taken") {
          setError("Esa pista se acaba de tomar. Elige otra.");
          setLaneId(null);
          setStep(3);
          loadLanes();
        } else {
          setError(data.message ?? "No se pudo crear la reserva.");
        }
        return;
      }
      setHeld(data.reservation);
      setStep(5);
    } catch {
      setError("Error de red al crear la reserva.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingConfig) {
    return <p className="text-muted">Cargando disponibilidad…</p>;
  }
  if (!config) {
    return <p className="text-red-400">{error ?? "No se pudo iniciar la reserva."}</p>;
  }

  const selectedSlot = slots.find((s) => s.index === startSlot) ?? null;
  const customerValid =
    customer.name.trim().length > 1 &&
    customer.doc.trim().length > 2 &&
    customer.phone.trim().length > 5 &&
    /.+@.+\..+/.test(customer.email);

  return (
    <div className="rounded-[var(--radius-brand)] border border-line bg-surface/60 p-5 sm:p-8">
      <Stepper step={step} />

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* ── Paso 0: Día ── */}
      {step === 0 && (
        <Section title="¿Qué día quieres jugar?">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {dates.map((d) => (
              <button
                key={d.ymd}
                type="button"
                disabled={d.closed}
                onClick={() => chooseDate(d)}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors ${
                  d.closed
                    ? "cursor-not-allowed border-line bg-surface-2/40 text-muted/40"
                    : "border-line bg-surface-2 text-cream hover:border-accent hover:text-accent"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wide">{d.weekdayLabel}</span>
                <span className="mt-1 text-sm font-semibold">{d.dayNum}</span>
                {d.closed && <span className="mt-1 text-[10px]">Cerrado</span>}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ── Paso 1: Hora + duración ── */}
      {step === 1 && (
        <Section title="Elige la hora y la duración">
          {loadingSlots ? (
            <p className="text-muted">Cargando franjas…</p>
          ) : slots.length === 0 ? (
            <p className="text-muted">Ese día está cerrado. Vuelve y elige otro.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s.index}
                    type="button"
                    disabled={!s.selectable}
                    onClick={() => chooseSlot(s)}
                    className={`rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                      startSlot === s.index
                        ? "border-accent bg-accent text-accent-ink"
                        : s.selectable
                          ? "border-line bg-surface-2 text-cream hover:border-accent"
                          : "cursor-not-allowed border-line bg-surface-2/40 text-muted/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {startSlot !== null && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-cream">Duración</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from({ length: maxTurnsHere }, (_, i) => i + 1).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTurns(t)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          turns === t
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-line bg-surface-2 text-cream hover:border-accent"
                        }`}
                      >
                        {t * config.durationMinutes} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <NavButtons
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={startSlot === null}
          />
        </Section>
      )}

      {/* ── Paso 2: Jugadores ── */}
      {step === 2 && (
        <Section title="¿Cuántos van a jugar?">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: config.maxPlayersPerLane }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlayers(n)}
                className={`h-12 w-12 rounded-lg border text-sm font-semibold transition-colors ${
                  players === n
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line bg-surface-2 text-cream hover:border-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Máximo {config.maxPlayersPerLane} jugadores por pista.
          </p>
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Section>
      )}

      {/* ── Paso 3: Pista (maqueta) ── */}
      {step === 3 && (
        <Section title="Elige tu pista">
          <Summary
            date={date}
            slotLabel={selectedSlot?.label}
            turns={turns}
            durationMinutes={config.durationMinutes}
            players={players}
          />
          {loadingLanes ? (
            <p className="mt-4 text-muted">Cargando pistas…</p>
          ) : (
            <>
              <LaneGrid
                lanes={lanes}
                selected={laneId}
                onSelect={(id) => setLaneId(id)}
              />
              <Legend />
              {price && (
                <p className="mt-4 text-sm text-muted">
                  Precio: <span className="text-cream">{cop(price.total)}</span> · Anticipo
                  para separar:{" "}
                  <span className="font-semibold text-accent">{cop(price.deposit)}</span>
                </p>
              )}
            </>
          )}
          <NavButtons
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            nextDisabled={laneId === null}
          />
        </Section>
      )}

      {/* ── Paso 4: Datos ── */}
      {step === 4 && (
        <Section title="Tus datos">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo">
              <input
                className="input"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </Field>
            <Field label="Documento / cédula">
              <input
                className="input"
                value={customer.doc}
                onChange={(e) => setCustomer({ ...customer, doc: e.target.value })}
                placeholder="C.C."
              />
            </Field>
            <Field label="Celular / WhatsApp">
              <input
                className="input"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="300 000 0000"
              />
            </Field>
            <Field label="Correo">
              <input
                className="input"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
              />
            </Field>
          </div>
          {price && (
            <p className="mt-5 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
              Para separar la pista pagas un anticipo de{" "}
              <span className="font-semibold text-accent">{cop(price.deposit)}</span> (de{" "}
              {cop(price.total)} totales). El bloqueo dura {config.holdMinutes} minutos
              mientras completas el pago.
            </p>
          )}
          <NavButtons
            onBack={() => setStep(3)}
            onNext={submitHold}
            nextLabel={submitting ? "Reservando…" : "Separar con anticipo"}
            nextDisabled={!customerValid || submitting}
          />
        </Section>
      )}

      {/* ── Paso 5: Confirmación (hold creado) ── */}
      {step === 5 && held && (
        <Confirmation held={held} holdMinutes={config.holdMinutes} onRestart={() => {
          setStep(0);
          setDate(null);
          setStartSlot(null);
          setLaneId(null);
          setHeld(null);
          setCustomer({ name: "", doc: "", phone: "", email: "" });
        }} />
      )}

      {/* Panel de validación anti-doble-reserva (visible desde el paso de pista) */}
      {step >= 3 && date && startSlot !== null && (
        <RaceDemo date={date} startSlot={startSlot} turns={turns} onChanged={loadLanes} />
      )}
    </div>
  );
}

/* ── Subcomponentes ──────────────────────────────────────────────────────── */

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
              i < step
                ? "border-accent bg-accent text-accent-ink"
                : i === step
                  ? "border-accent text-accent"
                  : "border-line text-muted"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === step ? "text-cream" : "text-muted"}>{label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 text-line">→</span>}
        </li>
      ))}
    </ol>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="font-display text-xl text-cream">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg px-4 py-2 text-sm text-muted hover:text-cream"
      >
        ← Atrás
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-[var(--radius-brand)] bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

function Summary({
  date,
  slotLabel,
  turns,
  durationMinutes,
  players,
}: {
  date: string | null;
  slotLabel?: string;
  turns: number;
  durationMinutes: number;
  players: number;
}) {
  return (
    <p className="text-sm text-muted">
      <span className="text-cream">{date}</span> · {slotLabel} ·{" "}
      {turns * durationMinutes} min · {players} jugador{players > 1 ? "es" : ""}
    </p>
  );
}

const CELL_CLASS: Record<LaneCellStatus, string> = {
  free: "border-lane-free/50 bg-lane-free/15 text-cream hover:border-lane-free",
  held: "cursor-not-allowed border-lane-held/40 bg-lane-held/15 text-muted",
  booked: "cursor-not-allowed border-line bg-surface-2 text-muted/50",
  blocked: "cursor-not-allowed border-line bg-surface-2 text-muted/50",
};

function LaneGrid({
  lanes,
  selected,
  onSelect,
}: {
  lanes: LaneAvailability[];
  selected: number | null;
  onSelect: (laneId: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {lanes.map((l) => {
        const isFree = l.status === "free";
        const isSelected = selected === l.laneId;
        return (
          <button
            key={l.laneId}
            type="button"
            disabled={!isFree}
            onClick={() => onSelect(l.laneId)}
            aria-label={`Pista ${l.laneId} ${l.status}`}
            className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
              isSelected
                ? "border-accent bg-accent text-accent-ink"
                : CELL_CLASS[l.status]
            }`}
          >
            <span className="text-[10px] font-normal uppercase opacity-70">Pista</span>
            {l.laneId}
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  const items: { label: string; cls: string }[] = [
    { label: "Disponible", cls: "bg-lane-free" },
    { label: "Bloqueada (pagando)", cls: "bg-lane-held" },
    { label: "Reservada", cls: "bg-surface-2 border border-line" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded ${i.cls}`} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function Confirmation({
  held,
  holdMinutes,
  onRestart,
}: {
  held: HeldReservation;
  holdMinutes: number;
  onRestart: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresAt = held.holdExpiresAt ? new Date(held.holdExpiresAt).getTime() : 0;
  const remainingMs = Math.max(0, expiresAt - now);
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const expired = !paid && remainingMs <= 0;

  async function simulatePayment() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/reservar/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: held.reference }),
      });
      const data = await res.json();
      if (data.ok) setPaid(true);
      else setPayError(data.reason ?? "No se pudo confirmar.");
    } catch {
      setPayError("Error de red al confirmar.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mt-6">
      {paid ? (
        <div className="rounded-[var(--radius-brand)] border border-lane-free/40 bg-lane-free/10 p-6">
          <h2 className="font-display text-2xl text-cream">¡Reserva confirmada! 🎳</h2>
          <p className="mt-2 text-muted">
            Pista {held.laneId} · {held.date}. Referencia{" "}
            <span className="text-cream">{held.reference}</span>. Te enviamos el
            comprobante por correo.
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-brand)] border border-accent/40 bg-accent/5 p-6">
          <h2 className="font-display text-2xl text-cream">Pista bloqueada para ti</h2>
          <p className="mt-2 text-muted">
            Pista {held.laneId} · referencia{" "}
            <span className="text-cream">{held.reference}</span>.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-sm text-muted">Tiempo para pagar el anticipo:</span>
            <span
              className={`font-display text-2xl ${expired ? "text-red-400" : "text-accent"}`}
            >
              {expired ? "Expirado" : `${mm}:${ss.toString().padStart(2, "0")}`}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="text-cream">{cop(held.amountTotal)}</dd>
            </div>
            <div>
              <dt className="text-muted">Anticipo a pagar ahora</dt>
              <dd className="font-semibold text-accent">{cop(held.amountDeposit)}</dd>
            </div>
          </dl>

          {payError && <p className="mt-3 text-sm text-red-300">{payError}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={expired || paying}
              onClick={simulatePayment}
              className="rounded-[var(--radius-brand)] bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {paying ? "Procesando…" : "Simular pago aprobado (Wompi sandbox)"}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-[var(--radius-brand)] border border-line px-6 py-3 text-sm text-cream hover:border-accent"
            >
              Nueva reserva
            </button>
          </div>
          <p className="mt-4 text-xs text-muted">
            El bloqueo dura {holdMinutes} min. Si no pagas a tiempo, la pista se libera
            automáticamente. En producción, el pago lo confirma el webhook firmado de
            Wompi (única fuente de verdad).
          </p>
        </div>
      )}
    </div>
  );
}

type RaceResult = {
  laneId: number;
  intentos: { cliente: string; resultado: string; reference?: string; motivo?: string }[];
  explicacion: string;
};

function RaceDemo({
  date,
  startSlot,
  turns,
  onChanged,
}: {
  date: string;
  startSlot: number;
  turns: number;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RaceResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setErr(null);
    setResult(null);
    try {
      const res = await fetch("/api/reservar/demo-carrera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startSlot, turns }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "No se pudo correr la prueba.");
      } else {
        setResult(data);
        onChanged();
      }
    } catch {
      setErr("Error de red.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-8 border-t border-line pt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium uppercase tracking-wide text-muted hover:text-accent"
      >
        {open ? "▾" : "▸"} Prueba: doble reserva con pagos simultáneos
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-line bg-surface-2/60 p-4 text-sm">
          <p className="text-muted">
            Lanza dos reservas a la vez sobre la misma pista y franja (la primera
            libre). Solo una gana; la otra recibe <code className="text-accent">lane_taken</code>.
          </p>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="mt-3 rounded-lg border border-accent px-4 py-2 text-xs font-semibold text-accent hover:bg-accent hover:text-accent-ink disabled:opacity-40"
          >
            {running ? "Corriendo…" : "Lanzar dos reservas simultáneas"}
          </button>
          {err && <p className="mt-3 text-red-300">{err}</p>}
          {result && (
            <div className="mt-4 space-y-1">
              <p className="text-cream">Pista en disputa: #{result.laneId}</p>
              {result.intentos.map((i) => (
                <p key={i.cliente} className="text-muted">
                  <span className="text-cream">{i.cliente}:</span>{" "}
                  {i.resultado === "ganó la pista" ? (
                    <span className="text-lane-free">
                      ganó la pista ({i.reference})
                    </span>
                  ) : (
                    <span className="text-red-300">rechazado — {i.motivo}</span>
                  )}
                </p>
              ))}
              <p className="mt-2 text-xs text-muted">{result.explicacion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
