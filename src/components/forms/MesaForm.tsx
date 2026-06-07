"use client";

import { useState } from "react";
import { whatsappLink, mailtoLink } from "@/lib/contact";

/**
 * Solicitud de reserva de mesa (restaurante) — sin pago.
 * Es solo una solicitud que llega por WhatsApp/correo; el equipo confirma.
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

  const valid = form.name.trim().length > 1 && form.contact.trim().length > 4;

  function buildMessage(): string {
    return [
      "¡Hola Super Bowling! Quiero reservar una mesa 🍽️",
      `• Nombre: ${form.name}`,
      `• Contacto: ${form.contact}`,
      form.date && `• Fecha: ${form.date}`,
      form.time && `• Hora: ${form.time}`,
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
          <input className="input" type="date" value={form.date} onChange={set("date")} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Hora</span>
          <input className="input" type="time" value={form.time} onChange={set("time")} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">N.º de personas</span>
          <input className="input" inputMode="numeric" value={form.people} onChange={set("people")} placeholder="Ej: 4" />
        </label>
        <label className="block">
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
