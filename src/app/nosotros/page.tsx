import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import ReserveButton from "@/components/ui/ReserveButton";
import ParallaxBackground from "@/components/ui/ParallaxBackground";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Super Bowling Medellín: complejo de entretenimiento premium en Envigado con bolera, restaurante & bar, ahumados, hachas, billar y shows en vivo. Experiencias salvajes.",
};

const offerings: { title: string; desc: string }[] = [
  { title: "Bolera", desc: "16 pistas profesionales con neón y zonas lounge." },
  { title: "Restaurante & bar", desc: "Parrilla y ahumados a la leña, sushi de autor, pizzas y coctelería." },
  { title: "Ahumados & parrilla", desc: "Cortes importados y ahumados de leña por horas." },
  { title: "Hachas", desc: "Lanzamiento de hachas para sacar al guerrero que llevas dentro." },
  { title: "Billares", desc: "Mesas para una partida tranquila o un torneo entre amigos." },
  { title: "Shows en vivo", desc: "Música, DJ y noches que se sienten." },
  { title: "Pantalla gigante", desc: "La pantalla más grande de Medellín para vivir cada partido." },
];

const gallery = [
  { src: "/Entrada_lugar.jpg", alt: "Entrada de Super Bowling Medellín" },
  { src: "/Lobby.jpg", alt: "Lobby principal" },
  { src: "/Restaurante_aereo.jpg", alt: "Vista aérea del restaurante" },
  { src: "/Luces.jpg", alt: "Sala de neón dorado" },
  { src: "/Mesas_lobby.jpg", alt: "Mesas del lobby" },
  { src: "/Techo.jpg", alt: "Diseño de techo iluminado" },
];

export default function NosotrosPage() {
  return (
    <div className="pb-24 pt-28">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <ParallaxBackground src="/Lobby.jpg" alt="" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            {site.slogan}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-5xl font-black text-cream sm:text-7xl">
            Somos la <span className="text-shine">tribu</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            No es solo una bolera: es un complejo premium donde la comida, los tragos y el
            juego se vuelven un ritual salvaje.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-black text-cream sm:text-4xl">Nuestra historia</h2>
        <div className="mt-5 space-y-4 text-muted">
          <p>
            Abrimos nuestras puertas en <span className="text-cream">agosto de 2021</span>{" "}
            en San Jorge, Envigado, con una idea clara: llevar la diversión a otro nivel.
            Tomamos lo mejor de una bolera de talla mundial —16 pistas profesionales—
            y lo mezclamos con alta cocina, ahumados de leña y coctelería de autor para
            crear algo nuevo en la ciudad.
          </p>
          <p>
            Hacemos parte de <span className="text-cream">{site.group}</span>, con presencia
            también en Bogotá. Nuestro espacio, premiado por su diseño, combina estilo
            industrial, grandes ventanales y una ambientación que va de lo elegante a lo
            salvaje en un mismo lugar.
          </p>
          <p>
            Lo que nos mueve son las <span className="text-accent">experiencias salvajes</span>:
            esa energía de tribu donde cada visita se siente como un evento. Por algo somos
            uno de los planes favoritos de Medellín, con una comunidad de más de{" "}
            <span className="text-cream">160 mil</span> seguidores que viven la marca.
          </p>
          <p className="text-sm text-muted/80">
            <span className="text-accent">[POR CONFIRMAR]</span> Detalles como el equipo
            fundador, hitos y reconocimientos exactos los ajustamos con la información oficial
            que nos compartas.
          </p>
        </div>
      </section>

      {/* Qué ofrecemos */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-cream sm:text-4xl">Qué ofrecemos</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Un solo lugar, mil planes. Todo pensado para que no quieras irte.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((o) => (
              <div
                key={o.title}
                className="rounded-[var(--radius-brand)] border border-line bg-surface-2/60 p-5 transition-colors hover:border-accent/50"
              >
                <span aria-hidden className="block h-0.5 w-8 bg-accent/60" />
                <h3 className="mt-4 font-display text-lg font-black text-cream">{o.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instalaciones */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-black text-cream sm:text-4xl">Nuestras instalaciones</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Espacios amplios y de diseño, hechos para vivirlos y para la foto.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {gallery.map((g) => (
            <div
              key={g.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)]"
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <h2 className="font-display text-4xl font-black text-cream sm:text-5xl">
            Ven a ser parte de la tribu
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ReserveButton href="/reservar/pista">Reservar pista</ReserveButton>
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center rounded-[var(--radius-brand)] border border-line px-7 py-3.5 text-center text-sm font-semibold text-cream transition-colors hover:border-accent"
            >
              Cotizar un evento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
