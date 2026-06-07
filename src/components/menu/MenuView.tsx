"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { menu, MENU_PDF, type MenuItem } from "@/lib/menu";

/**
 * Carta navegable: barra de categorías fija con resaltado de la sección activa
 * (IntersectionObserver) y tarjetas de platos. El contenido vive en src/lib/menu.ts.
 */
export default function MenuView() {
  const [active, setActive] = useState(menu[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = menu
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // La franja activa es la parte superior de la ventana (bajo la barra).
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Mantiene visible el chip activo dentro de la barra desplazable.
  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    btn?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      {/* Barra de categorías */}
      <div className="sticky top-16 z-30 -mx-4 border-y border-line bg-ink/90 backdrop-blur-md sm:-mx-6 lg:-mx-8">
        <div
          ref={navRef}
          className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {menu.map((c) => (
            <button
              key={c.id}
              data-cat={c.id}
              type="button"
              onClick={() => go(c.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active === c.id
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-surface-2 text-muted hover:border-accent hover:text-cream"
              }`}
            >
              {c.emoji && <span className="mr-1.5">{c.emoji}</span>}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Secciones */}
      <div className="mt-10 space-y-16">
        {menu.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-32">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-cream sm:text-4xl">
                {cat.emoji && <span className="mr-2">{cat.emoji}</span>}
                {cat.name}
              </h2>
            </div>
            {cat.note && <p className="mt-2 max-w-2xl text-sm text-muted">{cat.note}</p>}

            {cat.image && (
              <div className="relative mt-5 h-44 overflow-hidden rounded-[var(--radius-brand)] sm:h-56">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              </div>
            )}

            <div className="mt-6 space-y-8">
              {cat.groups.map((g, gi) => (
                <div key={g.name ?? gi}>
                  {g.name && (
                    <h3 className="mb-3 font-display text-lg text-accent">{g.name}</h3>
                  )}
                  {g.note && <p className="mb-3 text-sm text-muted">{g.note}</p>}
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {g.items.map((item) => (
                      <Dish key={item.name} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA PDF al final */}
      <div className="mt-16 flex flex-col items-center gap-3 border-t border-line pt-10 text-center">
        <p className="text-muted">¿Prefieres la carta completa en PDF?</p>
        <a
          href={MENU_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[var(--radius-brand)] border border-accent px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
        >
          Ver carta en PDF ↗
        </a>
      </div>
    </div>
  );
}

function Dish({ item }: { item: MenuItem }) {
  return (
    <li className="rounded-xl border border-line bg-surface-2/50 p-4 transition-colors hover:border-accent/50">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-medium text-cream">{item.name}</h4>
        {item.price && (
          <span className="shrink-0 whitespace-nowrap font-display text-sm text-accent">
            {item.price}
          </span>
        )}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {item.desc && <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>}
    </li>
  );
}
