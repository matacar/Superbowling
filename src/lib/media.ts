/**
 * MANIFIESTO DE MEDIOS — Super Bowling Medellín
 * ──────────────────────────────────────────────
 * Fuente única de verdad de las fotos del sitio y dónde aparece cada una.
 * Cambiar la asignación de una foto se hace AQUÍ, sin tocar componentes.
 *
 * Reglas de reparto (definidas con el cliente):
 *  - hero      → la foto horizontal más impactante (las 16 pistas iluminadas).
 *  - food      → cocina y restaurante.
 *  - gallery   → el resto de los ambientes del lugar.
 *
 * Todos los archivos viven en /public. `src` ya viene listo para <Image>.
 */

export type Photo = {
  /** Ruta pública servible directamente por <Image src>. */
  src: string;
  /** Texto alternativo (accesibilidad + SEO). */
  alt: string;
};

const p = (file: string, alt: string): Photo => ({ src: `/${file}`, alt });

/** Logo de marca (JPG, letras doradas sobre negro). */
export const logo = p("Logo.jpg", "Logo de Super Bowling Medellín");

/** HERO — la foto horizontal más impactante. */
export const heroPhoto = p(
  "Foto_pistas.jpg",
  "Las 16 pistas de bolos de Super Bowling Medellín bajo luces de neón",
);

/** COCINA & RESTAURANTE. La primera se usa como foto grande de la sección. */
export const foodPhotos: Photo[] = [
  p("Restaurante_aereo.jpg", "Vista aérea del restaurante de Super Bowling"),
  p("Comida.jpg", "Plato de la cocina de Super Bowling"),
  p("Comidas-2.jpg", "Selección de platos de la carta"),
  p("Comidas-3.jpg", "Más platos de la parrilla y la cocina de la casa"),
  p("Restaurante.jpg", "Zona de restaurante y bar de Super Bowling"),
];

/** GALERÍA — el resto de los ambientes del lugar. */
export const galleryPhotos: Photo[] = [
  p("Pistas.jpg", "Las 16 pistas de bolos bajo luces de neón"),
  p("Luces.jpg", "Sala de espejos con neón dorado y sillas tipo trono"),
  p("Bolos.jpg", "Bolos y bola lista para jugar"),
  p("Pistas_sofa.jpg", "Pistas con zona de sofás lounge"),
  p("Lobby.jpg", "Lobby principal de Super Bowling"),
  p("Mesas_lobby.jpg", "Mesas en el lobby para acompañantes"),
  p("Zona_billar.jpg", "Zona de billar"),
  p("Eventos.jpg", "Espacio para eventos privados y corporativos"),
  p("Entrada_lugar.jpg", "Entrada de Super Bowling Medellín"),
  p("Techo.jpg", "Diseño de techo iluminado"),
  p("Techo-2.jpg", "Detalle del techo iluminado"),
  p("Techo-3.jpg", "Ambiente nocturno bajo el techo iluminado"),
];
