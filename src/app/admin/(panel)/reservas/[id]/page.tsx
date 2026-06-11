/**
 * Detalle de una reserva — TODOS los datos: cliente, pista, fecha/hora,
 * jugadores, estado del pago, anticipo, referencia y transacción de Wompi.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getReservationById, timeRangeFor } from "@/lib/admin/queries";
import { getSettings, formatCOP } from "@/lib/reservations/settings";
import { getAdminContext, type AdminRole } from "@/lib/auth/admin";
import { OP_CHIP, OP_LABEL, STATUS_CHIP, STATUS_LABEL } from "@/lib/admin/labels";
import ReservaActions from "./_Actions";

export const dynamic = "force-dynamic";

function dateTimeBogota(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(iso));
}

export default async function ReservaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getReservationById(id);
  if (!r) notFound();

  const s = getSettings();
  const durationMin = r.turns * s.turn.durationMinutes;
  const auth = await getAdminContext();
  const role: AdminRole = auth.status === "ok" ? auth.ctx.role : "recepcion";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/reservas" className="text-sm text-muted hover:text-cream">
          ← Volver a reservas
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">
            {r.customer?.name ?? "—"}
          </h1>
          <p className="text-sm text-muted">Referencia {r.reference}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip className={STATUS_CHIP[r.status]}>{STATUS_LABEL[r.status]}</Chip>
          <Chip className={OP_CHIP[r.opStatus]}>{OP_LABEL[r.opStatus]}</Chip>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Reserva">
          <Row k="Pista" v={`Pista ${r.laneId}`} />
          <Row k="Fecha" v={r.date} />
          <Row k="Horario" v={timeRangeFor(r.date, r.startSlot, r.turns)} />
          <Row k="Duración" v={`${r.turns} turno(s) · ${durationMin} min`} />
          <Row k="Jugadores" v={String(r.players)} />
          <Row k="Creada" v={dateTimeBogota(r.createdAt)} />
        </Section>

        <Section title="Cliente">
          <Row k="Nombre" v={r.customer?.name ?? "—"} />
          <Row k="Documento" v={r.customer?.doc || "—"} />
          <Row k="Teléfono" v={r.customer?.phone || "—"} />
          <Row k="Correo" v={r.customer?.email || "—"} />
        </Section>

        <Section title="Pago" className="md:col-span-2">
          <Row k="Estado del pago" v={STATUS_LABEL[r.status]} />
          <Row k="Anticipo pagado" v={formatCOP(r.amountDeposit)} />
          <Row k="Total de la reserva" v={formatCOP(r.amountTotal)} />
          <Row k="Referencia" v={r.reference} />
          <Row
            k="Transacción Wompi"
            v={r.wompiTransactionId || "— (aún sin pago real)"}
          />
          <Row
            k="Comprobante"
            v={
              r.wompiTransactionId
                ? "Disponible cuando se integre Wompi en vivo"
                : "—"
            }
          />
        </Section>
      </div>

      <ReservaActions
        id={r.id}
        status={r.status}
        opStatus={r.opStatus}
        players={r.players}
        customer={r.customer}
        role={role}
      />
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-brand border border-line bg-surface p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-medium text-accent">{title}</h2>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right text-cream">{v}</dd>
    </div>
  );
}
