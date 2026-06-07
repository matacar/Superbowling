import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de Super Bowling Medellín.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-cream sm:text-5xl">Términos y condiciones</h1>

      <div className="mt-6 rounded-lg border border-dashed border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
        [POR CONFIRMAR] Contenido legal pendiente. El cliente debe entregar los términos
        definitivos (reservas, anticipos, cancelaciones, uso de datos) para publicarlos.
      </div>

      <div className="mt-8 space-y-4 text-muted">
        <p>
          Estos términos regulan el uso del sitio y los servicios de {site.name}. Al
          reservar una pista o solicitar una mesa, aceptas las condiciones que aquí se
          describan.
        </p>
        <p>
          <span className="text-cream">Reservas y anticipos.</span> La reserva de pista se
          asegura con un anticipo; las condiciones de cancelación y reembolso se definirán
          aquí. <span className="text-accent">[POR CONFIRMAR]</span>
        </p>
        <p>
          <span className="text-cream">Contacto.</span> Para cualquier duda, escríbenos a{" "}
          <a className="text-accent hover:underline" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
