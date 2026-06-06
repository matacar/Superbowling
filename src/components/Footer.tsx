import Link from "next/link";
import { navLinks, site } from "@/lib/site";

/** Footer global: navegación, contacto, redes, sedes del grupo y legal. */
export default function Footer() {
  const year = 2026; // se actualiza en build

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-1">
            <span className="font-display text-xl font-bold tracking-wide text-cream">
              SUPER<span className="text-accent">BOWLING</span>
            </span>
            <p className="mt-3 text-sm text-muted">{site.tagline}</p>
            <p className="mt-4 text-xs uppercase tracking-widest text-accent">
              {site.slogan}
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Pie de página">
            <h3 className="text-sm font-semibold text-cream">Explora</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-cream">Contacto</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>{site.contact.address}</li>
              <li>
                <a className="hover:text-cream" href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a className="hover:text-cream" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  className="text-accent hover:underline"
                  href={site.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escríbenos por WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Grupo + redes */}
          <div>
            <h3 className="text-sm font-semibold text-cream">Super Bowling Group</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {site.venues.map((v) => (
                <li key={v.name}>
                  <a
                    className="hover:text-cream"
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {v.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-4 text-sm">
              <a
                className="text-muted hover:text-cream"
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                className="text-muted hover:text-cream"
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <p className="flex gap-4">
            <Link href="/legal/terminos" className="hover:text-cream">
              Términos
            </Link>
            <Link href="/legal/privacidad" className="hover:text-cream">
              Privacidad
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
