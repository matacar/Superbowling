"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Imagen de fondo con profundidad sutil:
 * - Parallax al hacer scroll (se mueve más lento que la página).
 * - Profundidad siguiendo el mouse (solo punteros finos = escritorio).
 * - Usa transform + requestAnimationFrame (sin reflow, fluido).
 * - Respeta prefers-reduced-motion (apaga el efecto) y degrada en táctil.
 * El sobre-escalado (scale) crea margen para que el desplazamiento nunca
 * descubra los bordes de la imagen.
 */
export default function ParallaxBackground({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let scrollY = 0; // desplazamiento por scroll
    let mx = 0; // desplazamiento por mouse (x)
    let my = 0; // desplazamiento por mouse (y)
    let raf = 0;

    const render = () => {
      raf = 0;
      el.style.transform = `translate3d(${mx}px, ${scrollY + my}px, 0) scale(1.22)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onScroll = () => {
      // host.top va de 0 (arriba) a negativo al bajar → parallax suave.
      scrollY = -host.getBoundingClientRect().top * 0.1;
      schedule();
    };
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 20;
      my = (e.clientY / window.innerHeight - 0.5) * 20;
      schedule();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover ${className}`}
      />
    </div>
  );
}
