import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { heroPhoto, logo, foodPhotos, galleryPhotos } from "@/lib/media";
import ReserveButton from "@/components/ui/ReserveButton";
import ParallaxBackground from "@/components/ui/ParallaxBackground";
import StickyReserveBar from "@/components/ui/StickyReserveBar";

/**
 * HOME — renovación de diseño (2026-06).
 * Cada sección empuja a RESERVAR: copy corto, CTA "Reservar pista" siempre
 * protagonista, fondo con parallax y una sola palabra del hero con degradado
 * vibrante. Las fotos y su ubicación viven en src/lib/media.ts.
 */
export default function Home() {
  const [foodHero, ...dishes] = foodPhotos;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {/* Fondo: las 16 pistas iluminadas, con parallax sutil. */}
        <ParallaxBackground src={heroPhoto.src} alt={heroPhoto.alt} priority />
        {/* Capas de oscurecido + brillo dorado (legibilidad del texto). */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_0%,rgba(201,162,74,0.20),transparent_55%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          {/* Logo real de marca (mix-blend-screen quita el fondo negro del JPG). */}
          <Image
            src={logo.src}
            alt={logo.alt}
            width={560}
            height={206}
            priority
            className="h-auto w-[240px] max-w-full mix-blend-screen sm:w-[360px] lg:w-[420px]"
          />

          <p className="mt-6 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-accent-2">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--gradient-vibrant)" }}
            />
            {site.slogan}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-6xl font-black leading-[0.9] text-cream sm:text-8xl">
            Tu{" "}
            <span className="text-shine drop-shadow-[0_2px_28px_rgba(201,162,74,0.45)]">
              pista
            </span>
            <br />
            te espera
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            16 pistas, cocina y coctelería.{" "}
            <span className="font-semibold text-accent-2">Resérvala en segundos.</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ReserveButton href="/reservar/pista" size="lg" pulse>
              Reservar pista{" "}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </ReserveButton>
            <Link
              href="/reservar/mesa"
              className="inline-flex items-center justify-center rounded-[var(--radius-brand)] border border-line bg-surface/60 px-8 py-4 text-center text-base font-semibold text-cream backdrop-blur transition-colors hover:border-accent hover:text-accent"
            >
              Reservar mesa
            </Link>
          </div>

          {/* Datos clave en tira compacta (menos texto, más impacto). */}
          <dl className="mt-14 flex max-w-2xl flex-wrap gap-x-10 gap-y-5">
            {[
              { k: `${site.lanes}`, v: "Pistas profesionales" },
              { k: `${site.maxPlayersPerLane}`, v: "Jugadores por pista" },
              { k: "Asia", v: "Cocina & parrilla" },
              { k: "Eventos", v: "Privados & corporativos" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl text-cream sm:text-4xl">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-muted">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── COCINA & RESTAURANTE ─────────────────────────────────────── */}
      <section className="border-t border-line bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Cocina & bar
            </p>
            <h2 className="font-display mt-3 text-4xl font-black text-cream sm:text-6xl">
              No solo se juega.
              <br />
              <span className="text-accent">Se come increíble.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Cocina de Asia, parrilla y coctelería de autor para cada chuza.
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ReserveButton href="/reservar/pista">Reservar pista</ReserveButton>
            <Link
              href="/carta"
              className="inline-flex items-center justify-center rounded-[var(--radius-brand)] border border-line px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-accent hover:text-accent"
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              El lugar
            </p>
            <h2 className="font-display mt-3 text-4xl font-black text-cream sm:text-6xl">
              Hecho para vivirlo
            </h2>
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
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-black text-cream sm:text-5xl">
              ¿Listo para tu próxima <span className="text-shine">chuza</span>?
            </h2>
            <p className="mt-3 text-muted">Asegura tu pista con un anticipo. Confirmación inmediata.</p>
          </div>
          <ReserveButton href="/reservar/pista" size="lg" pulse>
            Reservar pista{" "}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </ReserveButton>
        </div>
      </section>

      {/* Barra de reserva fija (escritorio) que aparece tras el hero. */}
      <StickyReserveBar />
    </>
  );
}
