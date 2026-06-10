/**
 * Shell del PANEL (rutas protegidas). Vive en el route group `(panel)` para que
 * /admin/login quede FUERA de este layout y no entre en bucle de redirección.
 *
 * Aquí se aplica la autorización por rol EN EL SERVIDOR:
 *   - sin sesión        → al login (el middleware ya lo hace; doble seguridad).
 *   - sesión sin acceso → pantalla "sin acceso" + cerrar sesión.
 *   - autorizado        → shell con navegación + saludo con email y rol.
 */

import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/admin";
import LogoutButton from "@/app/admin/LogoutButton";
import AdminNav from "@/app/admin/(panel)/AdminNav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getAdminContext();

  if (result.status === "unauthenticated") redirect("/admin/login");

  if (result.status !== "ok") {
    const msg =
      result.status === "forbidden"
        ? `La cuenta ${result.email} no está autorizada para el panel.`
        : "El backend no está configurado (faltan credenciales de Supabase).";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-center">
        <div className="max-w-md space-y-4">
          <p className="font-display text-xl text-accent">Sin acceso</p>
          <p className="text-sm text-muted">{msg}</p>
          {result.status === "forbidden" && (
            <LogoutButton className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-2" />
          )}
        </div>
      </main>
    );
  }

  const { email, role } = result.ctx;
  const roleLabel = role === "admin" ? "Administrador" : "Recepción";

  return (
    <div className="min-h-screen bg-ink text-cream md:flex">
      {/* Navegación lateral (columna en desktop, barra arriba en tablet/móvil) */}
      <aside className="border-line bg-surface md:w-60 md:shrink-0 md:border-r">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 md:block">
          <div>
            <p className="font-display text-lg tracking-wide text-accent">
              SUPER BOWLING
            </p>
            <p className="text-xs text-muted">Panel de administración</p>
          </div>
        </div>
        <AdminNav role={role} />
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-surface/60 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-cream">{email}</p>
            <p className="text-xs text-accent">{roleLabel}</p>
          </div>
          <LogoutButton />
        </header>
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
