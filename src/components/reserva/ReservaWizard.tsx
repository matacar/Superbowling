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
    return <WizardSkeleton />;
  }
  if (!config) {
    return (
      <div className="rounded-[var(--radius-brand)] border border-red-500/30 bg-red-500/5 p-6 text-red-300">
        {error ?? "No se pudo iniciar la reserva."}
      </div>
    );
  }

  const selectedSlot = slots.find((s) => s.index === startSlot) ?? null;
  const selectedDate = dates.find((d) => d.ymd === date) ?? null;
  const customerValid =
    customer.name.trim().length > 1 &&
    customer.doc.trim().length > 2 &&
    customer.phone.trim().length > 5 &&
    /.+@.+\..+/.test(customer.email);

  function resetAll() {
    setStep(0);
    setDate(null);
    setStartSlot(null);
    setLaneId(null);
    setHeld(null);
    setCustomer({ name: "", doc: "", phone: "", email: "" });
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-brand)] border border-line bg-surface/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="border-b border-line bg-ink/40 px-5 py-5 sm:px-8">
        <Stepper step={step} />
        {step > 0 && step < 5 && (
          <SummaryChips
            dateLabel={selectedDate ? `${cap(selectedDate.weekdayLabel)} ${selectedDate.dayNum}` : null}
            slotLabel={selectedSlot?.label ?? null}
            durationLabel={
              startSlot !== null ? `${turns * config.durationMinutes} min` : null
            }
            players={step >= 2 ? players : null}
            laneId={laneId}
            onJump={setStep}
          />
        )}
      </div>

      <div className="p-5 sm:p-8">
        {error && (
          <p className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span aria-hidden>⚠</span>
            {error}
          </p>
        )}

        {/* ── Paso 0: Día ── */}
        {step === 0 && (
          <Section key="s0" title="¿Qué día quieres jugar?" subtitle="Elige una fecha disponible.">
            <DatePicker dates={dates} onChoose={chooseDate} />
          </Section>
        )}

        {/* ── Paso 1: Hora + duración ── */}
        {step === 1 && (
          <Section key="s1" title="Elige la hora y la duración">
            {loadingSlots ? (
              <PillSkeleton count={8} />
            ) : slots.length === 0 ? (
              <EmptyNote>Ese día está cerrado. Vuelve y elige otro.</EmptyNote>
            ) : (
              <>
                <SlotPicker slots={slots} selected={startSlot} onChoose={chooseSlot} />

                {startSlot !== null && (
                  <div className="mt-7">
                    <p className="text-sm font-medium text-cream">¿Cuánto tiempo?</p>
                    <div className="mt-2.5 inline-flex flex-wrap gap-2 rounded-xl border border-line bg-surface-2/60 p-1.5">
                      {Array.from({ length: maxTurnsHere }, (_, i) => i + 1).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTurns(t)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            turns === t
                              ? "bg-accent text-accent-ink"
                              : "text-cream hover:bg-surface-2"
                          }`}
                        >
                          {t * config.durationMinutes} min
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {cop(config.pricePerTurn)} por cada {config.durationMinutes} min ·{" "}
                      <span className="text-cream">{cop(config.pricePerTurn * turns)}</span>{" "}
                      en total por pista
                    </p>
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
          <Section
            key="s2"
            title="¿Cuántos van a jugar?"
            subtitle={`Hasta ${config.maxPlayersPerLane} jugadores por pista.`}
          >
            <PlayerPicker
              max={config.maxPlayersPerLane}
              value={players}
              onChange={setPlayers}
            />
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </Section>
        )}

        {/* ── Paso 3: Pista (maqueta) ── */}
        {step === 3 && (
          <Section key="s3" title="Elige tu pista">
            {loadingLanes ? (
              <LaneSkeleton />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <Legend lanes={lanes} />
                </div>
                <LaneGrid lanes={lanes} selected={laneId} onSelect={setLaneId} />
                {price && (
                  <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm">
                    <span className="text-muted">
                      Precio total:{" "}
                      <span className="text-cream">{cop(price.total)}</span>
                    </span>
                    <span className="text-muted">
                      Anticipo para separar:{" "}
                      <span className="font-semibold text-accent">{cop(price.deposit)}</span>
                    </span>
                  </div>
                )}
              </>
            )}
            <NavButtons
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              nextDisabled={laneId === null}
              nextLabel={laneId === null ? "Elige una pista" : "Continuar"}
            />
          </Section>
        )}

        {/* ── Paso 4: Datos ── */}
        {step === 4 && (
          <Section key="s4" title="Tus datos">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre completo">
                  <input
                    className="input"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Documento / cédula">
                  <input
                    className="input"
                    value={customer.doc}
                    onChange={(e) => setCustomer({ ...customer, doc: e.target.value })}
                    placeholder="C.C."
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Celular / WhatsApp">
                  <input
                    className="input"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="300 000 0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Correo">
                  <input
                    className="input"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                  />
                </Field>
              </div>

              <OrderSummary
                dateLabel={selectedDate ? `${cap(selectedDate.weekdayLabel)} ${selectedDate.dayNum}` : "—"}
                slotLabel={selectedSlot?.label ?? "—"}
                durationLabel={`${turns * config.durationMinutes} min`}
                players={players}
                laneId={laneId}
                price={price}
                holdMinutes={config.holdMinutes}
              />
            </div>

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
          <Confirmation held={held} holdMinutes={config.holdMinutes} onRestart={resetAll} />
        )}

        {/* Panel de validación anti-doble-reserva (visible desde el paso de pista) */}
        {step >= 3 && step < 5 && date && startSlot !== null && (
          <RaceDemo date={date} startSlot={startSlot} turns={turns} onChanged={loadLanes} />
        )}
      </div>
    </div>
  );
}

/* ── Utilidades ──────────────────────────────────────────────────────────── */

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Iconos ──────────────────────────────────────────────────────────────── */

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2c-1.6 0-2.8 1.3-2.8 2.9 0 .9.4 1.7 1 2.3-.7 1.4-1.1 3-1.1 4.7 0 2.2.5 4.2 1.2 6 .3.8.4 1.6.4 2.4v.2c0 .8.6 1.5 1.3 1.5s1.3-.7 1.3-1.5v-.2c0-.8.1-1.6.4-2.4.7-1.8 1.2-3.8 1.2-6 0-1.7-.4-3.3-1.1-4.7.6-.6 1-1.4 1-2.3C14.8 3.3 13.6 2 12 2Z" />
    </svg>
  );
}

function UsersIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <path d="M16 6.2A3 3 0 0 1 16 12M17 14.5c2.4.4 4 2.3 4 4.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Estructura ──────────────────────────────────────────────────────────── */

function Stepper({ step }: { step: number }) {
  const pct = (step / (STEPS.length - 1)) * 100;
  return (
    <div>
      {/* Barra de progreso */}
      <div className="relative mb-4 h-0.5 w-full rounded bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors ${
                  done
                    ? "border-accent bg-accent text-accent-ink"
                    : current
                      ? "border-accent text-accent"
                      : "border-line text-muted"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`hidden truncate text-[11px] sm:block ${
                  current ? "text-cream" : "text-muted"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SummaryChips({
  dateLabel,
  slotLabel,
  durationLabel,
  players,
  laneId,
  onJump,
}: {
  dateLabel: string | null;
  slotLabel: string | null;
  durationLabel: string | null;
  players: number | null;
  laneId: number | null;
  onJump: (step: number) => void;
}) {
  const chips: { label: string; step: number }[] = [];
  if (dateLabel) chips.push({ label: dateLabel, step: 0 });
  if (slotLabel) chips.push({ label: slotLabel, step: 1 });
  if (durationLabel) chips.push({ label: durationLabel, step: 1 });
  if (players) chips.push({ label: `${players} jugador${players > 1 ? "es" : ""}`, step: 2 });
  if (laneId) chips.push({ label: `Pista ${laneId}`, step: 3 });
  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={`${c.step}-${c.label}`}
          type="button"
          onClick={() => onJump(c.step)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/80 px-3 py-1 text-xs text-cream transition-colors hover:border-accent"
          title="Editar"
        >
          {c.label}
          <span className="text-muted transition-colors group-hover:text-accent">✎</span>
        </button>
      ))}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="step-in">
      <h2 className="font-display text-xl text-cream sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
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
        className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-cream"
      >
        ← Atrás
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-[var(--radius-brand)] bg-accent px-7 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-surface-2/60 px-4 py-6 text-center text-muted">
      {children}
    </p>
  );
}

/* ── Paso 0: selector de fecha (agrupado por mes) ─────────────────────────── */

function DatePicker({
  dates,
  onChoose,
}: {
  dates: BookableDate[];
  onChoose: (d: BookableDate) => void;
}) {
  const groups = useMemo(() => groupByMonth(dates), [dates]);
  const todayYmd = dates[0]?.ymd;

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {g.label}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {g.items.map((d) => {
              const isToday = d.ymd === todayYmd;
              const [, dayPart] = d.dayNum.split(" de ");
              const dayNumber = d.dayNum.split(" ")[0];
              return (
                <button
                  key={d.ymd}
                  type="button"
                  disabled={d.closed}
                  onClick={() => onChoose(d)}
                  className={`group relative flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-all ${
                    d.closed
                      ? "cursor-not-allowed border-line/60 bg-surface-2/30 text-muted/40"
                      : "border-line bg-surface-2 text-cream hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide">
                    {cap(d.weekdayLabel)}
                  </span>
                  <span className="mt-0.5 font-display text-xl leading-none">{dayNumber}</span>
                  <span className="mt-0.5 text-[10px] uppercase text-muted">{dayPart}</span>
                  {isToday && !d.closed && (
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                  {d.closed && <span className="mt-1 text-[10px]">Cerrado</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByMonth(dates: BookableDate[]): { label: string; items: BookableDate[] }[] {
  const out: { label: string; items: BookableDate[] }[] = [];
  for (const d of dates) {
    const [y, m] = d.ymd.split("-").map(Number);
    const label = cap(
      new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(
        new Date(y, m - 1, 1),
      ),
    );
    const last = out[out.length - 1];
    if (last && last.label === label) last.items.push(d);
    else out.push({ label, items: [d] });
  }
  return out;
}

/* ── Paso 1: selector de hora (agrupado tarde / noche) ────────────────────── */

function SlotPicker({
  slots,
  selected,
  onChoose,
}: {
  slots: Slot[];
  selected: number | null;
  onChoose: (s: Slot) => void;
}) {
  const groups = [
    { label: "Tarde", items: slots.filter((s) => s.startMinutes < 18 * 60) },
    { label: "Noche", items: slots.filter((s) => s.startMinutes >= 18 * 60) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {g.label}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {g.items.map((s) => (
              <button
                key={s.index}
                type="button"
                disabled={!s.selectable}
                onClick={() => onChoose(s)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-all ${
                  selected === s.index
                    ? "border-accent bg-accent text-accent-ink"
                    : s.selectable
                      ? "border-line bg-surface-2 text-cream hover:-translate-y-0.5 hover:border-accent"
                      : "cursor-not-allowed border-line/60 bg-surface-2/30 text-muted/40 line-through"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Paso 2: selector de jugadores ────────────────────────────────────────── */

function PlayerPicker({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-base font-semibold transition-all ${
              value === n
                ? "border-accent bg-accent text-accent-ink"
                : "border-line bg-surface-2 text-cream hover:-translate-y-0.5 hover:border-accent"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <UsersIcon className="h-4 w-4 text-accent" />
        {value} jugador{value > 1 ? "es" : ""} en la pista
      </p>
    </div>
  );
}

/* ── Paso 3: maqueta de pistas ────────────────────────────────────────────── */

const CELL_BASE =
  "group relative flex aspect-[5/8] flex-col items-center justify-between overflow-hidden rounded-t-lg rounded-b-md border pb-2 pt-2 text-sm font-semibold transition-all";

const CELL_CLASS: Record<LaneCellStatus, string> = {
  free: "lane-boards border-lane-free/40 text-cream hover:-translate-y-0.5 hover:border-lane-free",
  held: "cursor-not-allowed border-lane-held/40 bg-lane-held/10 text-lane-held",
  booked: "cursor-not-allowed border-line bg-surface-2/60 text-muted/50",
  blocked: "cursor-not-allowed border-line bg-surface-2/60 text-muted/50",
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
            aria-label={`Pista ${l.laneId}: ${labelFor(l.status)}`}
            aria-pressed={isSelected}
            className={`${CELL_BASE} ${
              isSelected
                ? "-translate-y-0.5 border-accent bg-accent text-accent-ink shadow-[0_8px_24px_-8px_rgba(201,162,74,0.6)]"
                : CELL_CLASS[l.status]
            }`}
          >
            {/* Pines en la cabecera del carril */}
            <span className="flex gap-0.5 opacity-80">
              <PinIcon className="h-2.5 w-2.5" />
              <PinIcon className="h-2.5 w-2.5" />
              <PinIcon className="h-2.5 w-2.5" />
            </span>
            <span className="font-display text-lg leading-none">{l.laneId}</span>
            <span className="text-[9px] font-normal uppercase tracking-wide opacity-70">
              {isSelected ? "Elegida" : shortLabel(l.status)}
            </span>
            {isSelected && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-ink text-accent">
                <CheckIcon className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function labelFor(s: LaneCellStatus): string {
  return s === "free" ? "disponible" : s === "held" ? "bloqueada" : "reservada";
}
function shortLabel(s: LaneCellStatus): string {
  return s === "free" ? "Libre" : s === "held" ? "Ocupada" : "Reservada";
}

function Legend({ lanes }: { lanes: LaneAvailability[] }) {
  const freeCount = lanes.filter((l) => l.status === "free").length;
  const items: { label: string; cls: string }[] = [
    { label: "Disponible", cls: "bg-lane-free" },
    { label: "Bloqueada", cls: "bg-lane-held" },
    { label: "Reservada", cls: "border border-line bg-surface-2" },
  ];
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {items.map((i) => (
          <span key={i.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ${i.cls}`} />
            {i.label}
          </span>
        ))}
      </div>
      <span className="text-xs text-muted">
        <span className="font-semibold text-lane-free">{freeCount}</span> de {lanes.length}{" "}
        disponibles
      </span>
    </div>
  );
}

/* ── Paso 4: resumen de pedido ────────────────────────────────────────────── */

function OrderSummary({
  dateLabel,
  slotLabel,
  durationLabel,
  players,
  laneId,
  price,
  holdMinutes,
}: {
  dateLabel: string;
  slotLabel: string;
  durationLabel: string;
  players: number;
  laneId: number | null;
  price: Price | null;
  holdMinutes: number;
}) {
  return (
    <aside className="h-fit rounded-xl border border-line bg-surface-2/60 p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Tu reserva
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Día" value={dateLabel} />
        <Row label="Hora" value={slotLabel} />
        <Row label="Duración" value={durationLabel} />
        <Row label="Jugadores" value={String(players)} />
        <Row label="Pista" value={laneId ? `#${laneId}` : "—"} />
      </dl>
      {price && (
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <Row label="Total" value={cop(price.total)} />
          <div className="flex items-baseline justify-between">
            <dt className="text-muted">Anticipo ahora</dt>
            <dd className="font-display text-xl text-accent">{cop(price.deposit)}</dd>
          </div>
        </div>
      )}
      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Bloqueamos tu pista {holdMinutes} min mientras pagas el anticipo. El resto se
        paga en el lugar.
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-cream">{value}</dd>
    </div>
  );
}

/* ── Paso 5: confirmación ─────────────────────────────────────────────────── */

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
  const totalMs = holdMinutes * 60_000;
  const remainingMs = Math.max(0, expiresAt - now);
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

  if (paid) {
    return (
      <div className="step-in rounded-[var(--radius-brand)] border border-lane-free/40 bg-lane-free/10 p-7 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lane-free/20 text-lane-free">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h2 className="font-display mt-4 text-2xl text-cream sm:text-3xl">
          ¡Reserva confirmada! 🎳
        </h2>
        <p className="mt-2 text-muted">
          Pista {held.laneId} · {held.date}. Referencia{" "}
          <span className="text-cream">{held.reference}</span>.
          <br />
          Te enviamos el comprobante por correo.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 rounded-[var(--radius-brand)] border border-line px-6 py-3 text-sm text-cream transition-colors hover:border-accent"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="step-in rounded-[var(--radius-brand)] border border-accent/40 bg-accent/5 p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <CountdownRing remainingMs={remainingMs} totalMs={totalMs} expired={expired} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-display text-2xl text-cream">Pista bloqueada para ti</h2>
          <p className="mt-1 text-muted">
            Pista {held.laneId} · referencia{" "}
            <span className="text-cream">{held.reference}</span>
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="text-cream">{cop(held.amountTotal)}</dd>
            </div>
            <div>
              <dt className="text-muted">Anticipo a pagar ahora</dt>
              <dd className="font-display text-xl text-accent">{cop(held.amountDeposit)}</dd>
            </div>
          </dl>

          {payError && <p className="mt-3 text-sm text-red-300">{payError}</p>}

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              disabled={expired || paying}
              onClick={simulatePayment}
              className="rounded-[var(--radius-brand)] bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {paying ? "Procesando…" : "Simular pago aprobado (Wompi sandbox)"}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-[var(--radius-brand)] border border-line px-6 py-3 text-sm text-cream transition-colors hover:border-accent"
            >
              Nueva reserva
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-line/60 pt-4 text-xs leading-relaxed text-muted">
        El bloqueo dura {holdMinutes} min. Si no pagas a tiempo, la pista se libera
        automáticamente. En producción, el pago lo confirma el webhook firmado de Wompi
        (única fuente de verdad).
      </p>
    </div>
  );
}

function CountdownRing({
  remainingMs,
  totalMs,
  expired,
}: {
  remainingMs: number;
  totalMs: number;
  expired: boolean;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const frac = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const low = remainingMs <= 60_000 && !expired;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={expired ? "#f87171" : low ? "#f87171" : "var(--color-accent)"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - frac)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {expired ? (
          <span className="text-xs font-semibold text-red-400">Expirado</span>
        ) : (
          <>
            <span className={`font-display text-xl ${low ? "text-red-400" : "text-cream"}`}>
              {mm}:{ss.toString().padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-muted">restante</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Skeletons de carga ───────────────────────────────────────────────────── */

function WizardSkeleton() {
  return (
    <div className="rounded-[var(--radius-brand)] border border-line bg-surface/60 p-8">
      <div className="h-0.5 w-full animate-pulse rounded bg-line" />
      <div className="mt-6 h-6 w-56 animate-pulse rounded bg-surface-2" />
      <PillSkeleton count={7} />
    </div>
  );
}

function PillSkeleton({ count }: { count: number }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-2" />
      ))}
    </div>
  );
}

function LaneSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="aspect-[5/8] animate-pulse rounded-lg bg-surface-2" />
      ))}
    </div>
  );
}

/* ── Panel de prueba anti-doble-reserva ───────────────────────────────────── */

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
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-accent"
      >
        <span>{open ? "▾" : "▸"}</span>
        Prueba: doble reserva con pagos simultáneos
      </button>
      {open && (
        <div className="step-in mt-3 rounded-lg border border-line bg-surface-2/60 p-4 text-sm">
          <p className="text-muted">
            Lanza dos reservas a la vez sobre la misma pista y franja (la primera libre).
            Solo una gana; la otra recibe <code className="text-accent">lane_taken</code>.
          </p>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="mt-3 rounded-lg border border-accent px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-40"
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
                    <span className="text-lane-free">ganó la pista ({i.reference})</span>
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
