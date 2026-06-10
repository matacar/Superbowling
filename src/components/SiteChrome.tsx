"use client";

/**
 * Envoltura de la navegación PÚBLICA (navbar, footer, botón flotante).
 * Se oculta por completo en el panel (/admin), que tiene su propio shell.
 * Footer y FloatingReserve se reciben como props (son server components).
 */

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function SiteChrome({
  children,
  footer,
  floating,
}: {
  children: ReactNode;
  footer: ReactNode;
  floating: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">{children}</main>
      {footer}
      {floating}
    </>
  );
}
