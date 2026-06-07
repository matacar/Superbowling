import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Placeholder from "@/components/Placeholder";
import QuoteForm from "@/components/forms/QuoteForm";

export const metadata: Metadata = {
  title: "Eventos & Experiencias",
  description:
    "Experiencias salvajes en Super Bowling Medellín: bolera, hachas, billares, ahumados & parrilla, shows en vivo y la pantalla más grande de Medellín. Cotiza tu evento.",
};

type Experience = {
  emoji: string;
  title: string;
  desc: string;
  image: string | null; // null = foto pendiente
  cta: { label: string; href: string };
};

const COTIZA = { label: "Cotiza tu evento", href: "#cotizar" };

const experiences: Experience[] = [
  {
    emoji: "🦍",
    title: "Experiencias Salvajes",
    desc: "No es salir un rato: es entrar a la tribu. Un complejo premium donde la comida, los tragos y el juego se vuelven un ritual. Energía salvaje de principio a fin.",
    image: "/Eventos.jpg",
    cta: COTIZA,
  },
  {
    emoji: "🎤",
    title: "Shows en vivo",
    desc: "Música, DJ y noches que se sienten. La ambientación de neón y nuestra programación en vivo convierten cualquier plan en un planazo.",
    image: "/Luces.jpg",
    cta: COTIZA,
  },
  {
    emoji: "🎳",
    title: "Bolera",
    desc: "16 pistas profesionales Brunswick con iluminación de neón y zonas lounge. El corazón salvaje del lugar: reserva tu pista y arma la rodada.",
    image: "/Pistas_sofa.jpg",
    cta: { label: "Reservar pista", href: "/reservar/pista" },
  },
  {
    emoji: "🪓",
    title: "Hachas",
    desc: "Lanzamiento de hachas para sacar al guerrero que llevas dentro. Perfecto para retar a tu parche o romper el hielo en un evento de empresa.",
    image: "/Hacha.jpg",
    cta: COTIZA,
  },
  {
    emoji: "🎱",
    title: "Billares",
    desc: "Mesas para una partida tranquila o un torneo entre amigos, con trago en mano y buena música de fondo.",
    image: "/Zona_billar.jpg",
    cta: COTIZA,
  },
  {
    emoji: "🔥",
    title: "Ahumados & Parrilla",
    desc: "Cortes importados, ahumados de leña por horas y rituales de fuego en la mesa. Sabor salvaje hecho con paciencia para cerrar la noche a lo grande.",
    image: "/Comida.jpg",
    cta: { label: "Ver la carta", href: "/carta" },
  },
  {
    emoji: "📺",
    title: "La pantalla más grande de Medellín",
    desc: "Vive los partidos y eventos como nunca, en una pantalla gigante con sonido envolvente. El mejor palco de la ciudad para no perderte nada.",
    image: "/Pantalla.jpg",
    cta: COTIZA,
  },
];

export default function EventosPage() {
  return (
    <div className="pb-24 pt-28">
      {/* Encabezado */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Eventos & experiencias
        </p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl text-cream sm:text-6xl">
          Experiencias <span className="text-accent">salvajes</span> 🦍
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Un solo lugar, mil planes. Arma tu evento privado o corporativo y combina bolos,
          hachas, billar, ahumados, shows en vivo y mucho más.
        </p>
      </header>

      {/* Bloques de experiencias (alternados) */}
      <div className="mx-auto mt-16 max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {experiences.map((exp, i) => {
          const reversed = i % 2 === 1;
          return (
            <section
              key={exp.title}
              className="grid items-center gap-8 lg:grid-cols-2"
            >
              <div className={reversed ? "lg:order-2" : ""}>
                {exp.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)]">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  </div>
                ) : (
                  <Placeholder
                    label={`${exp.title} — agregar foto en /public`}
                    className="aspect-[4/3]"
                  />
                )}
              </div>

              <div className={reversed ? "lg:order-1" : ""}>
                <h2 className="font-display text-3xl text-cream sm:text-4xl">
                  <span className="mr-2">{exp.emoji}</span>
                  {exp.title}
                </h2>
                <p className="mt-4 text-muted">{exp.desc}</p>
                <Link
                  href={exp.cta.href}
                  className="mt-6 inline-flex rounded-[var(--radius-brand)] border border-accent px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
                >
                  {exp.cta.label}
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* Cotiza tu evento */}
      <section id="cotizar" className="mt-24 scroll-mt-24 border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Cotiza tu evento
            </p>
            <h2 className="font-display mt-3 text-3xl text-cream sm:text-4xl">
              Cuéntanos tu plan y lo hacemos salvaje
            </h2>
            <p className="mt-4 text-muted">
              Cumpleaños, despedidas, grados o eventos de empresa. Déjanos tus datos y te
              armamos una propuesta a tu medida.
            </p>
          </header>

          <div className="mt-8">
            <QuoteForm />
          </div>
        </div>
      </section>
    </div>
  );
}
