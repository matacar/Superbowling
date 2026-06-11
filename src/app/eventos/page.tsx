import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Placeholder from "@/components/Placeholder";
import QuoteForm from "@/components/forms/QuoteForm";
import ReserveButton from "@/components/ui/ReserveButton";

export const metadata: Metadata = {
  title: "Eventos & Experiencias",
  description:
    "Experiencias salvajes en Super Bowling Medellín: bolera, hachas, billares, ahumados & parrilla, shows en vivo y la pantalla más grande de Medellín. Cotiza tu evento.",
};

type Experience = {
  title: string;
  desc: string;
  image: string | null; // null = foto pendiente
  cta: { label: string; href: string };
};

const COTIZA = { label: "Cotiza tu evento", href: "#cotizar" };

const experiences: Experience[] = [
  {
    title: "Experiencias Salvajes",
    desc: "No es salir un rato: es entrar a la tribu. Comida, tragos y juego vueltos ritual.",
    image: "/Eventos.jpg",
    cta: COTIZA,
  },
  {
    title: "Shows en vivo",
    desc: "Música, DJ y noches de neón que convierten cualquier plan en un planazo.",
    image: "/Luces.jpg",
    cta: COTIZA,
  },
  {
    title: "Bolera",
    desc: "16 pistas Brunswick con neón y zonas lounge. El corazón salvaje del lugar.",
    image: "/Pistas_sofa.jpg",
    cta: { label: "Reservar pista", href: "/reservar/pista" },
  },
  {
    title: "Hachas",
    desc: "Lanzamiento de hachas para sacar al guerrero que llevas dentro.",
    image: "/Hacha.jpg",
    cta: COTIZA,
  },
  {
    title: "Billares",
    desc: "Mesas para una partida tranquila o un torneo entre amigos, con trago en mano.",
    image: "/Zona_billar.jpg",
    cta: COTIZA,
  },
  {
    title: "Ahumados & Parrilla",
    desc: "Cortes importados y ahumados de leña por horas. Sabor salvaje hecho con paciencia.",
    image: "/Comida.jpg",
    cta: { label: "Ver la carta", href: "/carta" },
  },
  {
    title: "La pantalla más grande de Medellín",
    desc: "Vive los partidos en una pantalla gigante con sonido envolvente. El mejor palco de la ciudad.",
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
        <h1 className="font-display mt-3 max-w-3xl text-5xl font-black text-cream sm:text-7xl">
          Experiencias <span className="text-shine">salvajes</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Un solo lugar, mil planes. Arma tu evento privado o corporativo.
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
                <h2 className="font-display text-3xl font-black text-cream sm:text-4xl">
                  {exp.title}
                </h2>
                <p className="mt-4 text-muted">{exp.desc}</p>
                {exp.cta.href === "/reservar/pista" ? (
                  <div className="mt-6">
                    <ReserveButton href={exp.cta.href} size="sm">
                      {exp.cta.label}
                    </ReserveButton>
                  </div>
                ) : (
                  <Link
                    href={exp.cta.href}
                    className="mt-6 inline-flex rounded-[var(--radius-brand)] border border-accent px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
                  >
                    {exp.cta.label}
                  </Link>
                )}
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
            <h2 className="font-display mt-3 text-4xl font-black text-cream sm:text-5xl">
              Cuéntanos tu plan y lo hacemos salvaje
            </h2>
            <p className="mt-4 text-muted">
              Cumpleaños, despedidas, grados o eventos de empresa. Te armamos una propuesta a tu medida.
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
