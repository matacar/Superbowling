import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de tratamiento de datos personales de Super Bowling Medellín.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-cream sm:text-5xl">Política de privacidad</h1>

      <div className="mt-6 rounded-lg border border-dashed border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
        [POR CONFIRMAR] Política de tratamiento de datos pendiente de aprobación legal
        (Ley 1581 de 2012, Colombia). El cliente debe entregar la versión definitiva.
      </div>

      <div className="mt-8 space-y-4 text-muted">
        <p>
          En {site.name} tratamos tus datos personales (nombre, contacto y datos de la
          reserva) únicamente para gestionar reservas, eventos y atención al cliente.
        </p>
        <p>
          No compartimos tus datos con terceros salvo lo necesario para procesar el pago
          del anticipo. <span className="text-accent">[POR CONFIRMAR]</span>
        </p>
        <p>
          Puedes solicitar la consulta, actualización o eliminación de tus datos
          escribiendo a{" "}
          <a className="text-accent hover:underline" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
