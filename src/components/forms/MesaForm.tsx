"use client";

import { useMemo, useState } from "react";
import { whatsappLink, mailtoLink } from "@/lib/contact";
import { tableSlotsForDate } from "@/lib/restaurant";

/**
 * Solicitud de reserva de mesa (restaurante) — sin pago.
 * Es solo una solicitud que llega por WhatsApp/correo; el equipo confirma.
 * La hora se elige en franjas fijas de 30 min derivadas del horario del
 * restaurante (src/lib/restaurant.ts), no en un campo libre.
 */
export default function MesaForm() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    date: "",
    time: "",
    people: "",
    zone: "Restaurante",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // Al cambiar la fecha recalculamos las franjas y limpiamos la hora si ya no aplica.
  function onDate(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value;
    setForm((f) => ({
      ...f,
      date,
      time: tableSlotsForDate(date).includes(f.time) ? f.time : "",
    }));
  }

  const slots = useMemo(() => tableSlotsForDate(form.date), [form.date]);

  const valid = form.name.trim().length > 1 && form.contact.trim().length > 4;

  function buildMessage(): string {
    return [
      "¡Hola Super Bowling! Quiero reservar una mesa.",
      `• Nombre: ${form.name}`,
      `• Contacto: ${form.contact}`,
      form.date && `• Fecha: ${form.date}`,
      form.time && `• Hora: ${formatSlot(form.time)}`,
      form.people && `• Personas: ${form.people}`,
      `• Zona: ${form.zone}`,
      form.message && `• Nota: ${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function sendWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    window.open(whatsappLink(buildMessage()), "_blank", "noopener,noreferrer");
  }

  function sendEmail() {
    if (!valid) return;
    window.location.href = mailtoLink("Reserva de mesa — Super Bowling", buildMessage());
  }

  return (
    <form
      onSubmit={sendWhatsApp}
      className="rounded-[var(--radius-brand)] border border-line bg-surface-2/50 p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Nombre *</span>
          <input className="input" value={form.name} onChange={set("name")} placeholder="Tu nombre" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Teléfono o correo *</span>
          <input className="input" value={form.contact} onChange={set("contact")} placeholder="WhatsApp o email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Fecha</span>
          <input className="input" type="date" value={form.date} onChange={onDate} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">N.º de personas</span>
          <input className="input" inputMode="numeric" value={form.people} onChange={set("people")} placeholder="Ej: 4" />
        </label>

        {/* Hora — franjas fijas cada 30 min según el horario del restaurante. */}
        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm text-muted">Hora</span>
          {!form.date ? (
            <p className="text-sm text-muted/70">
              Elige primero una fecha para ver las franjas disponibles.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-accent">
              Ese día el restaurante está cerrado. Elige otra fecha.{" "}
              <span className="text-muted">[POR CONFIRMAR]</span>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Franja horaria">
              {slots.map((s) => {
                const selected = form.time === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm((f) => ({ ...f, time: s }))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line bg-surface-2 text-muted hover:border-accent hover:text-cream"
                    }`}
                  >
                    {formatSlot(s)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">Zona</span>
          <select className="input" value={form.zone} onChange={set("zone")}>
            {["Restaurante", "Bar", "Lounge", "Terraza", "Indiferente"].map((z) => (
              <option key={z} value={z} className="bg-surface text-cream">
                {z}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">Nota (opcional)</span>
          <textarea
            className="input min-h-20 resize-y"
            value={form.message}
            onChange={set("message")}
            placeholder="Cumpleaños, silla para bebé, etc."
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!valid}
          className="rounded-[var(--radius-brand)] bg-accent px-7 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Solicitar por WhatsApp
        </button>
        <button
          type="button"
          onClick={sendEmail}
          disabled={!valid}
          className="rounded-[var(--radius-brand)] border border-line px-7 py-3 text-sm font-semibold text-cream transition-colors enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enviar por correo
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">
        * La reserva de mesa no requiere pago: es una solicitud que confirmamos contigo.
      </p>
    </form>
  );
}

/** "19:00" → "7:00 p. m." (formato Colombia). */
function formatSlot(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "a. m." : "p. m.";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
