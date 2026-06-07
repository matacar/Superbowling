"use client";

import { useState } from "react";
import { whatsappLink, mailtoLink } from "@/lib/contact";

/**
 * "Cotiza tu evento" — formulario listo para conectar a email/WhatsApp.
 * Por ahora arma el mensaje y lo abre en WhatsApp o en el cliente de correo.
 * Cuando exista backend (Resend), basta cambiar handleSubmit por un POST.
 */
const EVENT_TYPES = [
  "Cumpleaños",
  "Empresarial / corporativo",
  "Despedida",
  "Grado",
  "Cena privada",
  "Otro",
];

export default function QuoteForm() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    type: EVENT_TYPES[0],
    date: "",
    people: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const valid = form.name.trim().length > 1 && form.contact.trim().length > 4;

  function buildMessage(): string {
    return [
      "¡Hola Super Bowling! Quiero cotizar un evento 🦍",
      `• Nombre: ${form.name}`,
      `• Contacto: ${form.contact}`,
      `• Tipo de evento: ${form.type}`,
      form.date && `• Fecha tentativa: ${form.date}`,
      form.people && `• N.º de personas: ${form.people}`,
      form.message && `• Mensaje: ${form.message}`,
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
    window.location.href = mailtoLink("Cotización de evento — Super Bowling", buildMessage());
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
          <span className="mb-1.5 block text-sm text-muted">Tipo de evento</span>
          <select className="input" value={form.type} onChange={set("type")}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-surface text-cream">
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Fecha tentativa</span>
          <input className="input" type="date" value={form.date} onChange={set("date")} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">N.º de personas</span>
          <input className="input" inputMode="numeric" value={form.people} onChange={set("people")} placeholder="Ej: 20" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">Mensaje</span>
          <textarea
            className="input min-h-24 resize-y"
            value={form.message}
            onChange={set("message")}
            placeholder="Cuéntanos qué tienes en mente: experiencias, ahumados, shows…"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!valid}
          className="rounded-[var(--radius-brand)] bg-accent px-7 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cotizar por WhatsApp
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
      <p className="mt-3 text-xs text-muted">* Campos obligatorios. Te respondemos lo antes posible.</p>
    </form>
  );
}
