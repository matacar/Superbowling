import Link from "next/link";
import { site } from "@/lib/site";

/**
 * HOME — placeholder de la Fase 0 (Cimientos).
 * Muestra el sistema de diseño, la navegación fija y el footer funcionando.
 * La Home completa (hero con video real, galería, eventos, prueba social)
 * se construye en la Fase 1.
 */
export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {/* Fondo provisional (en F1: video/imagen real del Instagram) */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_0%,rgba(245,179,1,0.18),transparent_55%),radial-gradient(100%_100%_at_0%_100%,rgba(255,61,110,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {site.slogan}
          </p>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.95] text-cream sm:text-7xl lg:text-8xl">
            El lugar premium de <span className="text-accent">bolos</span> y comida
            de Medellín
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            {site.lanes} pistas profesionales, cocina de Asia y parrilla, bar de
            cócteles y eventos inolvidables. Reserva tu pista en línea en segundos.
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

      {/* Aviso de fase (se elimina al construir la Home completa en F1) */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-muted">
            <span className="font-semibold text-accent">Fase 0 — Cimientos.</span>{" "}
            Navegación fija con CTA persistente, footer global y sistema de diseño
            (tokens) listos. Las secciones de marketing (carta, eventos, nosotros,
            galería real) y el sistema de reservas con maqueta de pistas se
            construyen en las fases siguientes.
          </p>
        </div>
      </section>
    </>
  );
}
