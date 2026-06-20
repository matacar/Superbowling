"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ReserveButton from "@/components/ui/ReserveButton";
import { RESERVE_HREF } from "@/lib/site";

/**
 * CTA flotante de reserva — visible solo en móvil.
 * Mantiene "Reservar" a un toque en cualquier página, pero SIN duplicarse:
 * - Se oculta dentro del flujo de reserva (/reservar/*), que ya tiene su
 *   propio botón al final ("Separar con anticipo").
 * - Se oculta mientras otro CTA de reserva (.reserve-btn del contenido) está
 *   en pantalla, para que nunca se vean dos botones "Reservar" pegados
 *   (p. ej. el del hero o el CTA final del inicio).
 */
export default function FloatingReserve() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  // Dentro del flujo de reserva el botón sobra (el flujo tiene el suyo).
  const onReserveFlow = pathname?.startsWith("/reservar") ?? false;

  useEffect(() => {
    if (onReserveFlow) return;
    const container = containerRef.current;
    // CTA de reserva del contenido (excluye el propio botón flotante).
    const ctas = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("a.reserve-btn"),
    ).filter((el) => !container || !container.contains(el));
    if (ctas.length === 0) {
      setCtaVisible(false);
      return;
    }
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setCtaVisible(visible.size > 0);
      },
      { threshold: 0 },
    );
    ctas.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, onReserveFlow]);

  if (onReserveFlow) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-x-4 bottom-4 z-40 transition-opacity duration-300 md:hidden ${
        ctaVisible ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={ctaVisible}
    >
      <ReserveButton
        href={RESERVE_HREF}
        size="md"
        pulse
        className="w-full rounded-full shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)]"
      >
        Reservar pista
      </ReserveButton>
    </div>
  );
}
