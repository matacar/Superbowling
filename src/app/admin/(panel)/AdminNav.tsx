"use client";

/**
 * Navegación del panel. Marca el ítem activo y oculta a "recepción" las
 * secciones solo-admin. Los ítems aún no construidos se muestran como
 * "pronto" (se activarán en las fases siguientes F-C..F-F).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/auth/admin";

type NavItem = {
  label: string;
  href: string;
  available: boolean;
  adminOnly?: boolean;
};

const ITEMS: NavItem[] = [
  { label: "Tablero", href: "/admin", available: true },
  { label: "Mapa de pistas", href: "/admin/pistas", available: true },
  { label: "Reservas", href: "/admin/reservas", available: true },
  { label: "Pagos", href: "/admin/pagos", available: true },
  { label: "Reportes", href: "/admin/reportes", available: true, adminOnly: true },
  { label: "Configuración", href: "/admin/configuracion", available: false, adminOnly: true },
  { label: "Usuarios", href: "/admin/usuarios", available: false, adminOnly: true },
];

export default function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = ITEMS.filter((it) => !it.adminOnly || role === "admin");

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
      {items.map((it) => {
        const active =
          it.href === "/admin"
            ? pathname === "/admin"
            : pathname === it.href || pathname.startsWith(`${it.href}/`);
        const base =
          "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition";

        if (!it.available) {
          return (
            <span
              key={it.href}
              aria-disabled="true"
              className={`${base} flex items-center justify-between gap-2 text-muted/50`}
            >
              {it.label}
              <span className="rounded bg-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                pronto
              </span>
            </span>
          );
        }

        return (
          <Link
            key={it.href}
            href={it.href}
            className={`${base} ${
              active
                ? "bg-accent text-accent-ink"
                : "text-muted hover:bg-surface-2 hover:text-cream"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
