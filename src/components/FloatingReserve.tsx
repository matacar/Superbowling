import Link from "next/link";
import { RESERVE_HREF } from "@/lib/site";

/**
 * CTA flotante de reserva — visible solo en móvil.
 * Garantiza que "Reservar" esté siempre a un toque, en cualquier página.
 */
export default function FloatingReserve() {
  return (
    <Link
      href={RESERVE_HREF}
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-center rounded-full bg-accent py-3.5 text-center text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] md:hidden"
    >
      Reservar pista
    </Link>
  );
}
