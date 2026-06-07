/**
 * Utilidades de contacto: arman enlaces de WhatsApp y correo prellenados.
 * Mientras no haya backend de email, los formularios abren WhatsApp o el
 * cliente de correo con el mensaje ya redactado.
 *
 * [POR CONFIRMAR] El número de WhatsApp es un candidato (300 884 8809).
 * Cuando el cliente confirme el definitivo, se cambia SOLO aquí.
 */
import { site } from "./site";

/** Número de WhatsApp en formato internacional sin signos (para wa.me). */
export const WHATSAPP_NUMBER = "573008848809"; // [POR CONFIRMAR]

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
