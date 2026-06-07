/**
 * Marcador visible para imágenes/datos que aún faltan del cliente.
 * Deja claro en pantalla qué falta, sin romper el diseño.
 */
export default function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[var(--radius-brand)] border border-dashed border-accent/40 bg-surface-2/60 p-6 text-center ${className}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-accent/80">
        📷 Foto pendiente
        <span className="mt-1 block font-normal normal-case text-muted">{label}</span>
      </span>
    </div>
  );
}
