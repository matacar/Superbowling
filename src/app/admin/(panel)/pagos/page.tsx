/**
 * Pagos — vista de las reservas con su estado de pago, anticipo y transacción
 * de Wompi, en un rango de fechas. La fuente de verdad del estado del pago es
 * Wompi (vía webhook); el panel refleja lo confirmado en la base.
 */

import Link from "next/link";
import { listReservations } from "@/lib/admin/queries";
import { formatCOP } from "@/lib/reservations/settings";
import { nowInBogota } from "@/lib/reservations/time";
import { STATUS_CHIP, STATUS_LABEL } from "@/lib/admin/labels";
import RealtimeRefresher from "@/app/admin/(panel)/_RealtimeRefresher";

export const dynamic = "force-dynamic";

function shortDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

function daysAgo(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = nowInBogota().ymd;
  const from = sp.from || daysAgo(today, 7);
  const to = sp.to || today;

  const all = await listReservations({ from, to });
  // Solo lo relevante para caja: con actividad de pago.
  const pagos = all.filter((r) =>
    ["confirmed", "pending_payment", "cancelled"].includes(r.status),
  );

  const totalConfirmado = pagos
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.amountDeposit, 0);
  const numConfirmadas = pagos.filter((r) => r.status === "confirmed").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">Pagos</h1>
          <p className="text-sm text-muted">
            {shortDate(from)} – {shortDate(to)}
          </p>
        </div>
        <RealtimeRefresher tables={["reservations"]} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-brand border border-line bg-surface p-5">
          <p className="text-sm text-muted">Anticipos confirmados</p>
          <p className="mt-2 text-2xl font-semibold text-lane-free">
            {formatCOP(totalConfirmado)}
          </p>
        </div>
        <div className="rounded-brand border border-line bg-surface p-5">
          <p className="text-sm text-muted">Pagos confirmados</p>
          <p className="mt-2 text-2xl font-semibold text-cream">{numConfirmadas}</p>
        </div>
      </div>

      {pagos.length === 0 ? (
        <p className="rounded-brand border border-line bg-surface p-8 text-center text-sm text-muted">
          Sin pagos en este rango.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-brand border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Referencia</Th>
                <Th>Estado</Th>
                <Th>Anticipo</Th>
                <Th>Transacción Wompi</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {pagos.map((r) => (
                <tr key={r.id} className="bg-ink hover:bg-surface-2">
                  <Td className="whitespace-nowrap text-muted">{shortDate(r.date)}</Td>
                  <Td className="max-w-[160px] truncate">
                    <Link href={`/admin/reservas/${r.id}`} className="text-cream hover:text-accent">
                      {r.customer?.name ?? "—"}
                    </Link>
                  </Td>
                  <Td className="font-mono text-xs text-muted">{r.reference}</Td>
                  <Td>
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CHIP[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-cream">{formatCOP(r.amountDeposit)}</Td>
                  <Td className="font-mono text-xs text-muted">
                    {r.wompiTransactionId || "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
