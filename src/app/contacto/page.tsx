import type { Metadata } from "next";
import { site } from "@/lib/site";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctanos: dirección, mapa, teléfono, WhatsApp, correo, horarios y redes de Super Bowling Medellín en Envigado.",
};

// Horarios confirmados por el cliente (domingo pendiente).
const hours: { day: string; value: string; pending?: boolean }[] = [
  { day: "Lunes a viernes", value: "3:00 p. m. – 11:59 p. m." },
  { day: "Sábado", value: "12:00 m. – 12:00 a. m." },
  { day: "Domingo", value: "Por confirmar", pending: true },
];

const mapsEmbed = `https://maps.google.com/maps?q=${site.contact.coords.lat},${site.contact.coords.lng}&z=16&output=embed`;

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Contacto
        </p>
        <h1 className="font-display mt-3 text-4xl text-cream sm:text-6xl">Hablemos</h1>
        <p className="mt-4 text-muted">
          ¿Una reserva, un evento o una duda? Estamos a un mensaje de distancia.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Datos + mapa */}
        <div className="space-y-8">
          <div className="space-y-5">
            <InfoRow label="Dirección">
              <p className="text-cream">{site.contact.address}</p>
              <p className="mt-1 text-xs text-accent">
                [CONFIRMAR DIRECCIÓN — el grupo tiene varias sedes; verificar la de esta sede]
              </p>
              <a
                href={site.contact.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-sm text-accent hover:underline"
              >
                Cómo llegar ↗
              </a>
            </InfoRow>

            <InfoRow label="Teléfono / WhatsApp">
              <a className="text-cream hover:text-accent" href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>
                {site.contact.phone}
              </a>
              <p className="mt-1 text-xs text-accent">[CONFIRMAR número vigente]</p>
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-sm text-accent hover:underline"
              >
                Escríbenos por WhatsApp ↗
              </a>
            </InfoRow>

            <InfoRow label="Correo">
              <a className="text-cream hover:text-accent" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
            </InfoRow>

            <InfoRow label="Horarios">
              <ul className="space-y-1">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4 text-sm">
                    <span className="text-muted">{h.day}</span>
                    <span className={h.pending ? "text-accent" : "text-cream"}>
                      {h.value}
                      {h.pending && " [POR CONFIRMAR]"}
                    </span>
                  </li>
                ))}
              </ul>
            </InfoRow>

            <InfoRow label="Redes">
              <div className="flex flex-wrap gap-4 text-sm">
                <a className="text-cream hover:text-accent" href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram @superbowlingmde
                </a>
                <a className="text-cream hover:text-accent" href={site.social.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a className="text-cream hover:text-accent" href={site.social.tiktok} target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
              </div>
              <p className="mt-1 text-xs text-accent">[CONFIRMAR handle oficial de TikTok]</p>
            </InfoRow>
          </div>

          {/* Mapa */}
          <div className="overflow-hidden rounded-[var(--radius-brand)] border border-line">
            <iframe
              title="Mapa de Super Bowling Medellín"
              src={mapsEmbed}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Formulario */}
        <div>
          <h2 className="font-display text-2xl text-cream">Envíanos un mensaje</h2>
          <p className="mt-2 text-sm text-muted">
            Completa el formulario y te respondemos por WhatsApp o correo.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-accent/40 pl-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
