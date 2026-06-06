import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { heroPhoto, logo, foodPhotos, galleryPhotos } from "@/lib/media";

/**
 * HOME — Fase 1 (marketing).
 * Reparte las fotos reales del lugar: la pista iluminada en el hero, la cocina
 * y el restaurante en su sección, y el resto de ambientes en la galería.
 * Las fotos y su ubicación se definen en src/lib/media.ts (no hardcodeadas aquí).
 */
export default function Home() {
  const [foodHero, ...dishes] = foodPhotos;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {/* Foto de fondo: las 16 pistas iluminadas */}
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Capas de oscurecido + brillo dorado de marca (legibilidad del texto) */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_0%,rgba(201,162,74,0.20),transparent_55%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          {/* Logo real de marca. mix-blend-screen elimina el fondo negro del JPG
              y deja flotar solo las letras doradas sobre la foto. */}
          <Image
            src={logo.src}
            alt={logo.alt}
            width={560}
            height={206}
            priority
            className="h-auto w-[280px] max-w-full mix-blend-screen sm:w-[420px] lg:w-[480px]"
          />

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {site.slogan}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] text-cream sm:text-6xl">
            El lugar premium de <span className="text-accent">bolos</span> y comida
            de Medellín
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            {site.lanes} pistas profesionales Brunswick, cocina de Asia y parrilla,
            bar de cócteles y eventos inolvidables. Reserva tu pista en línea en
            segundos.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservar/pista"
              className="rounded-[var(--radius-brand)] bg-accent px-7 py-3.5 text-center text-base font-semibold text-accent-ink transition-transform hover:scale-[1.03] active:scale-95"
            >
              Reservar pista
            </Link>
            <Link
              href="/reservar/mesa"
              className="rounded-[var(--radius-brand)] border border-line bg-surface/60 px-7 py-3.5 text-center text-base font-semibold text-cream backdrop-blur transition-colors hover:border-accent hover:text-accent"
            >
              Reservar mesa
            </Link>
          </div>

          {/* Stats */}
          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: `${site.lanes}`, v: "Pistas Brunswick" },
              { k: `${site.maxPlayersPerLane}`, v: "Jugadores por pista" },
              { k: "Asia", v: "Cocina & parrilla" },
              { k: "Eventos", v: "Privados & corporativos" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-4xl text-cream">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── COCINA & RESTAURANTE ─────────────────────────────────────── */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Cocina & restaurante
            </p>
            <h2 className="font-display mt-3 text-3xl text-cream sm:text-5xl">
              No solo se juega: se come increíble
            </h2>
            <p className="mt-4 text-muted">
              Cocina de Asia, parrilla y bar de cócteles para acompañar cada
              chuza. Ideal para una cita, un plan con amigos o cerrar un negocio.
            </p>
          </header>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {/* Foto grande de la sección */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)] lg:row-span-2 lg:aspect-auto">
              <Image
                src={foodHero.src}
                alt={foodHero.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Mosaico de platos */}
            <div className="grid grid-cols-2 gap-4">
              {dishes.map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-square overflow-hidden rounded-[var(--radius-brand)]"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/carta"
              className="inline-flex rounded-[var(--radius-brand)] border border-line px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-accent hover:text-accent"
            >
              Ver la carta
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALERÍA ──────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              El lugar
            </p>
            <h2 className="font-display mt-3 text-3xl text-cream sm:text-5xl">
              Un espacio para vivirlo
            </h2>
            <p className="mt-4 text-muted">
              Pistas de neón, zonas lounge, billar, salas para eventos y rincones
              hechos para la foto.
            </p>
          </header>

          {/* Masonry por columnas: respeta proporciones variadas de cada foto. */}
          <div className="mt-10 [column-fill:_balance] gap-4 sm:columns-2 lg:columns-3">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.src}
                className="group mb-4 overflow-hidden rounded-[var(--radius-brand)] break-inside-avoid"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={800}
                  height={600}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              ¿Listo para tu próxima chuza?
            </h2>
            <p className="mt-2 text-muted">
              Asegura tu pista con un anticipo. Confirmación inmediata.
            </p>
          </div>
          <Link
            href="/reservar/pista"
            className="rounded-[var(--radius-brand)] bg-accent px-8 py-4 text-base font-semibold text-accent-ink transition-transform hover:scale-[1.03] active:scale-95"
          >
            Reservar pista
          </Link>
        </div>
      </section>
    </>
  );
}
