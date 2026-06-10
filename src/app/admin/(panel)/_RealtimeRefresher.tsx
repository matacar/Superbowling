"use client";

/**
 * Suscripción REALTIME del panel. Escucha cambios en las tablas indicadas
 * (reservas, bloqueos) y refresca la vista del servidor sin recargar la página.
 * Así, cuando entra una reserva pagada desde la web, el mapa y las listas se
 * actualizan solos. Muestra un indicador "en vivo".
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RealtimeRefresher({
  tables = ["reservations", "blocks"],
}: {
  tables?: string[];
}) {
  const router = useRouter();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel("admin-realtime");

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh(),
      );
    }

    channel.subscribe((status) => {
      setLive(status === "SUBSCRIBED");
    });

    return () => {
      supabase.removeChannel(channel);
    };
    // tables es estable en la práctica (literal por página)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          live ? "bg-lane-free" : "bg-line"
        }`}
      />
      {live ? "en vivo" : "conectando…"}
    </span>
  );
}
