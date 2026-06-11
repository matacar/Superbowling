"use client";

/**
 * Aviso de RESERVA NUEVA en todo el panel. Escucha las inserciones en
 * `reservations` (entra por la web o se crea manual) y, sin recargar:
 *   - reproduce un "ping" corto (Web Audio, sin archivo de sonido),
 *   - muestra un aviso temporal con la pista y el cliente,
 *   - refresca la vista para que los conteos y listas se actualicen.
 *
 * Va en el layout del panel, así que está activo en todas las pantallas.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Toast = { id: number; text: string };

function ping() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
    osc.onended = () => ctx.close();
  } catch {
    // Si el navegador bloquea el audio, el aviso visual igual aparece.
  }
}

export default function Notifier() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-nuevas-reservas")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          const r = payload.new as { lane_id?: number; customer?: { name?: string } };
          const name = r.customer?.name ?? "Cliente";
          const text = `Nueva reserva · Pista ${r.lane_id ?? "?"} · ${name}`;
          seq.current += 1;
          const id = seq.current;
          setToasts((t) => [...t, { id, text }]);
          ping();
          router.refresh();
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2 rounded-brand border border-accent/40 bg-surface px-4 py-3 text-sm text-cream shadow-[var(--shadow-glow)]"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
          {t.text}
        </div>
      ))}
    </div>
  );
}
