import type { Metadata } from "next";
import MesaForm from "@/components/forms/MesaForm";

export const metadata: Metadata = {
  title: "Reservar mesa",
  description:
    "Solicita tu mesa en el restaurante & bar de Super Bowling Medellín. Sin pago: te confirmamos por WhatsApp.",
};

export default function ReservarMesaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Restaurante & bar
        </p>
        <h1 className="font-display mt-3 text-5xl font-black text-cream sm:text-6xl">
          Reserva tu <span className="text-shine">mesa</span>
        </h1>
        <p className="mt-4 text-muted">
          Déjanos tu solicitud y la confirmamos contigo. ¿Vienes a jugar?{" "}
          <a href="/reservar/pista" className="text-accent hover:underline">
            Reserva una pista
          </a>
          .
        </p>
      </header>

      <div className="mt-8">
        <MesaForm />
      </div>
    </div>
  );
}
