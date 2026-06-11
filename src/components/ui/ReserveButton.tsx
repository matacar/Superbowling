"use client";

import Link from "next/link";
import { useRef } from "react";

/**
 * CTA "Reservar" vivo y consistente en todo el sitio.
 * - Glow dorado + glint que sigue el cursor (micro-interacción).
 * - Animación al hover (lift) y al presionar (scale), foco visible por teclado
 *   (heredado del :focus-visible global de marca).
 * - El estilo vive en .reserve-btn (globals.css); aquí solo la interacción.
 */
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-8 py-4 text-base sm:text-lg",
};

export default function ReserveButton({
  href,
  children,
  className = "",
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: Size;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const raf = useRef<number | null>(null);

  // Mueve el glint hacia el cursor; throttle con requestAnimationFrame.
  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || raf.current) return;
    const { clientX, clientY } = e;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      className={`reserve-btn inline-flex items-center justify-center gap-2 rounded-[var(--radius-brand)] font-semibold ${SIZES[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
