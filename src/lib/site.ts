/**
 * Configuración central del sitio — Super Bowling Medellín.
 *
 * Único lugar para datos de marca, contacto, navegación y negocio.
 * Los valores marcados con [POR CONFIRMAR] provienen de investigación web
 * y deben validarse con el cliente antes de producción.
 */

export const site = {
  name: "Super Bowling Medellín",
  shortName: "Super Bowling",
  group: "Super Bowling Group",
  tagline: "El lugar premium de bolos y comida de Medellín",
  slogan: "Experiencias Salvajes", // eslogan del grupo
  description:
    "16 pistas profesionales, restaurante de parrilla y ahumados a la leña, sushi de autor, pizzas, bar de cócteles y eventos. Reserva tu pista en línea.",

  // ── Negocio (confirmado por investigación) ──
  lanes: 16, // pistas Brunswick (apertura ago. 2021)
  maxPlayersPerLane: 6,

  // ── Contacto ──
  contact: {
    email: "tureserva@superbowling.co",
    phone: "+57 300 884 8809", // [POR CONFIRMAR cuál es el vigente]
    whatsapp: "https://walink.co/e3b254",
    address: "Cra. 27 #23 Sur-120, San Jorge, Envigado, Antioquia",
    city: "Envigado, Antioquia",
    maps: "https://www.google.com/maps/search/?api=1&query=6.173809,-75.565696",
    coords: { lat: 6.173809, lng: -75.565696 },
  },

  // ── Horarios [POR CONFIRMAR con el cliente] ──
  // Referencia de sector mientras se confirman los reales.
  hours: [
    { day: "Lunes a jueves", value: "3:00 p. m. – 11:00 p. m.", confirmed: false },
    { day: "Viernes y sábado", value: "3:00 p. m. – 12:00 a. m.", confirmed: false },
    { day: "Domingos y festivos", value: "1:00 p. m. – 9:00 p. m.", confirmed: false },
  ],

  // ── Redes ──
  social: {
    instagram: "https://www.instagram.com/superbowlingmde/",
    facebook: "https://www.facebook.com/superbowlingmde/",
    tiktok: "https://www.tiktok.com/@superbowlingmde", // [POR CONFIRMAR handle oficial]
  },

  // ── Sedes del grupo ──
  venues: [
    { name: "Super Bowling Medellín", url: "https://medellin.superbowling.co/" },
    { name: "Super Bowling Bogotá", url: "https://superbowling.co/" },
    { name: "Super Bowling Acuario", url: "https://superbowling.co/" },
  ],
} as const;

/** Navegación principal (la usan Navbar y Footer). */
export const navLinks = [
  { label: "Bolos", href: "/reservar/pista" },
  { label: "Carta", href: "/carta" },
  { label: "Eventos", href: "/eventos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;

/** Destino del CTA persistente de reserva. */
export const RESERVE_HREF = "/reservar/pista";
