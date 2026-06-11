import ReserveButton from "@/components/ui/ReserveButton";
import { RESERVE_HREF } from "@/lib/site";

/**
 * CTA flotante de reserva — visible solo en móvil.
 * Garantiza que "Reservar" esté siempre a un toque, en cualquier página.
 * Usa el mismo botón vivo (glow) que el resto del sitio, a ancho completo.
 */
export default function FloatingReserve() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
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
