"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/media";

/**
 * Banner de imágenes que se deslizan automáticamente (cocina & restaurante).
 * - Avanza solo cada ~4.5 s y al tocar puntos/flechas.
 * - Deslizamiento por translateX; respeta prefers-reduced-motion (no auto-avanza
 *   y no anima, pero sigue siendo navegable).
 * - Swipe en táctil. Accesible: flechas y puntos con etiqueta y foco visible.
 */
export default function FoodCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const n = photos.length;
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIndex((i + n) % n);

  // Auto-avance (pausado si el usuario reduce el movimiento).
  useEffect(() => {
    if (n <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setIndex((p) => (p + 1) % n), 4500);
    return () => window.clearInterval(id);
  }, [n]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-brand)] border border-line"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carrusel"
    >
      {/* Pista de imágenes */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.map((ph, i) => (
          <div
            key={ph.src}
            className="relative aspect-[16/10] w-full shrink-0 sm:aspect-[16/8]"
            aria-hidden={i !== index}
          >
            <Image
              src={ph.src}
              alt={ph.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Velo inferior para legibilidad de los controles */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent" />

      {/* Flechas */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Imagen anterior"
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 text-xl text-cream backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Imagen siguiente"
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 text-xl text-cream backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        ›
      </button>

      {/* Puntos */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {photos.map((ph, i) => (
          <button
            key={ph.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-2 bg-cream/50 hover:bg-cream"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
