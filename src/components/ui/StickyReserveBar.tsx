"use client";

import { useEffect, useState } from "react";
import ReserveButton from "./ReserveButton";

/**
 * Barra de reserva fija para ESCRITORIO: aparece al pasar el hero para que
 * "Reservar pista" esté siempre a un clic. En móvil no se muestra (allí ya
 * existe el CTA flotante global).
 */
export default function StickyReserveBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-40 hidden justify-center px-4 transition-all duration-300 md:flex ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-ink/80 py-2 pl-6 pr-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.85)] backdrop-blur-md">
        <span className="font-display text-sm text-cream">¿Listo para jugar?</span>
        <ReserveButton href="/reservar/pista" size="sm" className="rounded-full">
          Reservar pista
        </ReserveButton>
      </div>
    </div>
  );
}
