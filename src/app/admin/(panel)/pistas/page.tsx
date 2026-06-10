/**
 * Mapa de pistas EN VIVO. Para un día y hora, muestra las 16 pistas con su
 * estado (libre / pagada / en proceso / bloqueada). Se actualiza solo cuando
 * entra o cambia una reserva (realtime). Clic en una pista ocupada → su detalle.
 */

import Link from "next/link";
import { getLaneMap, currentSlotIndex } from "@/lib/admin/queries";
import { getSettings } from "@/lib/reservations/settings";
import { bookableDates, generateSlots, nowInBogota } from "@/lib/reservations/time";
import { LANE_CELL, LANE_LABEL } from "@/lib/admin/labels";
import Controls from "./_Controls";
import RealtimeRefresher from "@/app/admin/(panel)/_RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function PistasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; slot?: string; turns?: string }>;
}) {
  const sp = await searchParams;
  const s = getSettings();

  const dates = bookableDates().filter((d) => !d.closed);
  const today = nowInBogota().ymd;
  const date = sp.date && dates.some((d) => d.ymd === sp.date) ? sp.date : (dates[0]?.ymd ?? today);

  const slots = generateSlots(date);
  const defaultSlot = currentSlotIndex(date) ?? 0;
  let startSlot = sp.slot ? Number(sp.slot) : defaultSlot;
  if (Number.isNaN(startSlot) || startSlot < 0 || startSlot >= slots.length) {
    startSlot = Math.min(defaultSlot, Math.max(0, slots.length - 1));
  }
  let turns = sp.turns ? Number(sp.turns) : 1;
  if (Number.isNaN(turns) || turns < 1) turns = 1;
  turns = Math.min(turns, s.turn.maxTurns);

  const cells = slots.length > 0 ? await getLaneMap(date, startSlot, turns) : [];

  const dateOptions = dates.map((d) => ({
    value: d.ymd,
    label: `${d.weekdayLabel} ${d.dayNum}`,
  }));
  const slotOptions = slots.map((sl) => ({ value: String(sl.index), label: sl.label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream">Mapa de pistas</h1>
          <p className="text-sm text-muted">Estado en tiempo real por día y hora.</p>
        </div>
        <RealtimeRefresher tables={["reservations", "blocks"]} />
      </div>

      <Controls
        date={date}
        startSlot={startSlot}
        turns={turns}
        dateOptions={dateOptions}
        slotOptions={slotOptions}
        maxTurns={s.turn.maxTurns}
      />

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        {(["free", "booked", "held", "blocked"] as const).map((k) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded border ${LANE_CELL[k]}`} />
            {LANE_LABEL[k]}
          </span>
        ))}
      </div>

      {slots.length === 0 ? (
        <p className="rounded-brand border border-line bg-surface p-6 text-center text-sm text-muted">
          Cerrado ese día.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cells.map((cell) => {
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">Pista {cell.laneId}</span>
                  <span className="text-xs">{LANE_LABEL[cell.status]}</span>
                </div>
                {cell.reservation ? (
                  <div className="mt-2 min-w-0">
                    <p className="truncate text-sm font-medium">{cell.reservation.name}</p>
                    <p className="text-xs opacity-80">
                      {cell.reservation.players} jugadores
                    </p>
                  </div>
                ) : cell.block ? (
                  <p className="mt-2 text-xs opacity-80">
                    {cell.block.reason || "Bloqueada"}
                  </p>
                ) : (
                  <p className="mt-2 text-xs opacity-70">Disponible</p>
                )}
              </>
            );

            const cls = `rounded-brand border p-4 transition ${LANE_CELL[cell.status]}`;

            return cell.reservation ? (
              <Link
                key={cell.laneId}
                href={`/admin/reservas/${cell.reservation.id}`}
                className={`${cls} hover:brightness-125`}
              >
                {inner}
              </Link>
            ) : (
              <div key={cell.laneId} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
