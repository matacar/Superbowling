"use client";

/**
 * Acciones operativas sobre una reserva: marcar llegada (llegó / no se presentó
 * / completada), editar jugadores y datos del cliente, y cancelar (libera la
 * pista). Marcar reembolso solo está disponible para administradores.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, ReservationStatus } from "@/lib/reservations/types";
import type { OpStatus } from "@/lib/admin/queries";
import type { AdminRole } from "@/lib/auth/admin";
import { OP_LABEL } from "@/lib/admin/labels";

const ACTIVE: ReservationStatus[] = ["hold", "pending_payment", "confirmed"];
const OP_OPTIONS: OpStatus[] = ["pendiente_llegada", "llego", "no_show", "completada"];

export default function ReservaActions({
  id,
  status,
  opStatus,
  players,
  customer,
  role,
}: {
  id: string;
  status: ReservationStatus;
  opStatus: OpStatus;
  players: number;
  customer: Customer;
  role: AdminRole;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    players,
    name: customer?.name ?? "",
    doc: customer?.doc ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
  });

  const isActive = ACTIVE.includes(status);

  async function call(url: string, options: RequestInit) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { "content-type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo completar la acción.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function setEstado(op: OpStatus) {
    await call(`/api/admin/reservas/${id}/estado`, {
      method: "POST",
      body: JSON.stringify({ opStatus: op }),
    });
  }

  async function cancelar() {
    const reembolso =
      role === "admin"
        ? confirm("¿Marcar reembolso del anticipo? (Aceptar = con reembolso, Cancelar = sin reembolso)")
        : false;
    if (!confirm("¿Cancelar esta reserva y liberar la pista?")) return;
    await call(`/api/admin/reservas/${id}/cancelar`, {
      method: "POST",
      body: JSON.stringify({ reembolso }),
    });
  }

  async function guardarEdicion() {
    const ok = await call(`/api/admin/reservas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        players: form.players,
        customer: { name: form.name, doc: form.doc, phone: form.phone, email: form.email },
      }),
    });
    if (ok) setEditing(false);
  }

  const btn =
    "rounded-lg border border-line px-3 py-1.5 text-sm transition disabled:opacity-50";
  const field =
    "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-accent";

  return (
    <section className="space-y-5 rounded-brand border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-accent">Acciones</h2>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Estado operativo */}
      {isActive ? (
        <div>
          <p className="mb-2 text-xs text-muted">Estado de llegada</p>
          <div className="flex flex-wrap gap-2">
            {OP_OPTIONS.map((op) => (
              <button
                key={op}
                type="button"
                disabled={busy}
                onClick={() => setEstado(op)}
                className={`${btn} ${
                  opStatus === op
                    ? "border-accent bg-accent text-accent-ink"
                    : "text-muted hover:border-accent hover:text-cream"
                }`}
              >
                {OP_LABEL[op]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Esta reserva está {status === "cancelled" ? "cancelada" : "inactiva"}; no admite acciones
          operativas.
        </p>
      )}

      {/* Editar */}
      {isActive && (
        <div>
          {!editing ? (
            <button type="button" className={btn} onClick={() => setEditing(true)}>
              Editar datos
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-muted">
                  Jugadores
                  <input
                    type="number"
                    min={1}
                    value={form.players}
                    onChange={(e) => setForm({ ...form, players: Number(e.target.value) })}
                    className={field}
                  />
                </label>
                <label className="text-xs text-muted">
                  Nombre
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={field}
                  />
                </label>
                <label className="text-xs text-muted">
                  Documento
                  <input
                    value={form.doc}
                    onChange={(e) => setForm({ ...form, doc: e.target.value })}
                    className={field}
                  />
                </label>
                <label className="text-xs text-muted">
                  Teléfono
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={field}
                  />
                </label>
                <label className="text-xs text-muted sm:col-span-2">
                  Correo
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={field}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={guardarEdicion}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink hover:bg-accent-2 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button type="button" className={btn} onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancelar reserva */}
      {isActive && (
        <div className="border-t border-line pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={cancelar}
            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Cancelar reserva y liberar pista
          </button>
        </div>
      )}
    </section>
  );
}
