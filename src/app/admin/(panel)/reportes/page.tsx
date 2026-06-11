/**
 * Reportes (solo administrador): reservas e ingresos por día en un rango, con
 * totales y exportación a CSV del detalle.
 */

import { getReportData, timeRangeFor } from "@/lib/admin/queries";
import { getAdminContext } from "@/lib/auth/admin";
import { formatCOP } from "@/lib/reservations/settings";
import { nowInBogota } from "@/lib/reservations/time";
import { OP_LABEL, STATUS_LABEL } from "@/lib/admin/labels";
import ExportCSV from "./_ExportCSV";

export const dynamic = "force-dynamic";

function daysAgo(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function shortDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "2-digit", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  // Solo administradores.
  const auth = await getAdminContext();
  if (auth.status !== "ok" || auth.ctx.role !== "admin") {
    return (
      <div className="rounded-brand border border-line bg-surface p-8 text-center text-sm text-muted">
        Los reportes son solo para administradores.
      </div>
    );
  }

  const sp = await searchParams;
  const today = nowInBogota().ymd;
  const from = sp.from || daysAgo(today, 7);
  const to = sp.to || today;

  const report = await getReportData(from, to);

  const csvHeaders = [
    "Fecha", "Horario", "Pista", "Cliente", "Documento", "Teléfono", "Correo",
    "Jugadores", "Estado pago", "Llegada", "Anticipo", "Total", "Referencia", "Transacción Wompi",
  ];
  const csvRows = report.detail.map((r) => [
    r.date,
    timeRangeFor(r.date, r.startSlot, r.turns),
    `P${r.laneId}`,
    r.customer?.name ?? "",
    r.customer?.doc ?? "",
    r.customer?.phone ?? "",
    r.customer?.email ?? "",
    String(r.players),
    STATUS_LABEL[r.status],
    OP_LABEL[r.opStatus],
    String(r.amountDeposit),
    String(r.amountTotal),
    r.reference,
    r.wompiTransactionId ?? "",
  ]);

  const field = "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">Reportes</h1>
          <p className="text-sm text-muted">
            {shortDate(from)} – {shortDate(to)}
          </p>
        </div>
        <ExportCSV
          headers={csvHeaders}
          rows={csvRows}
          filename={`reporte_${from}_a_${to}.csv`}
        />
      </div>

      {/* Filtro de rango (formulario nativo) */}
      <form method="get" className="flex flex-wrap items-end gap-3 rounded-brand border border-line bg-surface p-4">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Desde
          <input type="date" name="from" defaultValue={from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Hasta
          <input type="date" name="to" defaultValue={to} className={field} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition hover:bg-accent-2"
        >
          Aplicar
        </button>
      </form>

      {/* Totales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Ingresos (anticipos)" value={formatCOP(report.totalIngresos)} accent />
        <Card label="Reservas confirmadas" value={String(report.totalConfirmadas)} />
        <Card label="Canceladas" value={String(report.totalCanceladas)} />
      </div>

      {/* Tabla diaria */}
      {report.days.length === 0 ? (
        <p className="rounded-brand border border-line bg-surface p-8 text-center text-sm text-muted">
          Sin datos en este rango.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-brand border border-line">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Día</th>
                <th className="px-4 py-3 font-medium">Confirmadas</th>
                <th className="px-4 py-3 font-medium">Canceladas</th>
                <th className="px-4 py-3 font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {report.days.map((d) => (
                <tr key={d.date} className="bg-ink hover:bg-surface-2">
                  <td className="px-4 py-3 text-cream">{shortDate(d.date)}</td>
                  <td className="px-4 py-3 text-muted">{d.confirmadas}</td>
                  <td className="px-4 py-3 text-muted">{d.canceladas}</td>
                  <td className="px-4 py-3 text-cream">{formatCOP(d.ingresos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-brand border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-lane-free" : "text-cream"}`}>
        {value}
      </p>
    </div>
  );
}
