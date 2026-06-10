/**
 * Lista de reservas. Filtrable por rango de fechas, pista y estado, con
 * búsqueda por nombre. Atajos Hoy/Semana. Cada fila abre el detalle.
 * Se actualiza en vivo cuando entran reservas nuevas.
 */

import Link from "next/link";
import {
  listReservations,
  timeRangeFor,
  type ReservationFilters,
} from "@/lib/admin/queries";
import { getSettings, formatCOP } from "@/lib/reservations/settings";
import { nowInBogota } from "@/lib/reservations/time";
import type { ReservationStatus } from "@/lib/reservations/types";
import { OP_CHIP, OP_LABEL, STATUS_CHIP, STATUS_LABEL } from "@/lib/admin/labels";
import Filters from "./_Filters";
import RealtimeRefresher from "@/app/admin/(panel)/_RealtimeRefresher";

export const dynamic = "force-dynamic";

function weekRangeOf(ymd: string): { from: string; to: string } {
  const [y, m, d] = ymd.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const dow = (base.getDay() + 6) % 7; // 0 = lunes
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  return { from: fmt(monday), to: fmt(sunday) };
}

function shortDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "2-digit", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    lane?: string;
    status?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const s = getSettings();
  const today = nowInBogota().ymd;

  const from = sp.from || today;
  const to = sp.to || today;

  const filters: ReservationFilters = {
    from,
    to,
    laneId: sp.lane ? Number(sp.lane) : undefined,
    status: (sp.status as ReservationStatus) || undefined,
    q: sp.q || undefined,
  };
  const reservas = await listReservations(filters);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">Reservas</h1>
          <p className="text-sm text-muted">{reservas.length} resultado(s)</p>
        </div>
        <RealtimeRefresher tables={["reservations"]} />
      </div>

      <Filters
        from={from}
        to={to}
        laneId={sp.lane || ""}
        status={sp.status || ""}
        q={sp.q || ""}
        laneCount={s.venue.laneCount}
        todayRange={{ from: today, to: today }}
        weekRange={weekRangeOf(today)}
      />

      {reservas.length === 0 ? (
        <p className="rounded-brand border border-line bg-surface p-8 text-center text-sm text-muted">
          No hay reservas con esos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-brand border border-line">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <Th>Fecha</Th>
                <Th>Hora</Th>
                <Th>Pista</Th>
                <Th>Cliente</Th>
                <Th>Pers.</Th>
                <Th>Pago</Th>
                <Th>Anticipo</Th>
                <Th>Llegada</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {reservas.map((r) => (
                <tr key={r.id} className="group bg-ink hover:bg-surface-2">
                  <Td>
                    <Link href={`/admin/reservas/${r.id}`} className="block text-cream">
                      {shortDate(r.date)}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {timeRangeFor(r.date, r.startSlot, r.turns)}
                  </Td>
                  <Td className="text-cream">P{r.laneId}</Td>
                  <Td className="max-w-[180px] truncate text-cream">
                    {r.customer?.name ?? "—"}
                  </Td>
                  <Td className="text-muted">{r.players}</Td>
                  <Td>
                    <Chip className={STATUS_CHIP[r.status]}>{STATUS_LABEL[r.status]}</Chip>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatCOP(r.amountDeposit)}</Td>
                  <Td>
                    <Chip className={OP_CHIP[r.opStatus]}>{OP_LABEL[r.opStatus]}</Chip>
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
function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
