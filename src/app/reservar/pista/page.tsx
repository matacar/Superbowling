import type { Metadata } from "next";
import ReservaWizard from "@/components/reserva/ReservaWizard";

export const metadata: Metadata = {
  title: "Reservar pista",
  description:
    "Reserva tu pista de bolos en Super Bowling Medellín: elige día, hora, jugadores y pista. Asegúrala con un anticipo.",
};

export default function ReservarPistaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Reserva en línea
        </p>
        <h1 className="font-display mt-3 text-4xl text-cream sm:text-5xl">
          Reserva tu pista
        </h1>
        <p className="mt-4 text-muted">
          Elige día, hora, jugadores y pista. Aseguras tu turno con un anticipo y
          recibes la confirmación al instante.
        </p>
      </header>

      <p className="mt-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted">
        <span className="font-semibold text-accent">Vista de demostración.</span>{" "}
        La disponibilidad mostrada es simulada y el pago en línea (Wompi) estará disponible
        pronto. Puedes recorrer todo el flujo: día → hora → jugadores → pista.
      </p>

      <div className="mt-8">
        <ReservaWizard />
      </div>
    </div>
  );
}
