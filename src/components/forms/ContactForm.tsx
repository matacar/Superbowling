"use client";

import { useState } from "react";
import { whatsappLink, mailtoLink } from "@/lib/contact";

/**
 * Formulario de contacto simple. Listo para conectar a email (Resend) en el
 * futuro; por ahora abre WhatsApp o el cliente de correo con el mensaje armado.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const valid = form.name.trim().length > 1 && form.contact.trim().length > 4 && form.message.trim().length > 2;

  function buildMessage(): string {
    return [
      "¡Hola Super Bowling! 🦍",
      `• Nombre: ${form.name}`,
      `• Contacto: ${form.contact}`,
      `• Mensaje: ${form.message}`,
    ].join("\n");
  }

  function sendWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    window.open(whatsappLink(buildMessage()), "_blank", "noopener,noreferrer");
  }

  function sendEmail() {
    if (!valid) return;
    window.location.href = mailtoLink("Contacto — Super Bowling", buildMessage());
  }

  return (
    <form
      onSubmit={sendWhatsApp}
      className="rounded-[var(--radius-brand)] border border-line bg-surface-2/50 p-6 sm:p-8"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Nombre *</span>
          <input className="input" value={form.name} onChange={set("name")} placeholder="Tu nombre" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Email o teléfono *</span>
          <input className="input" value={form.contact} onChange={set("contact")} placeholder="¿Cómo te contactamos?" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Mensaje *</span>
          <textarea
            className="input min-h-28 resize-y"
            value={form.message}
            onChange={set("message")}
            placeholder="Escríbenos tu duda o solicitud…"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!valid}
          className="rounded-[var(--radius-brand)] bg-accent px-7 py-3 text-sm font-semibold text-accent-ink transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enviar por WhatsApp
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
    </form>
  );
}
