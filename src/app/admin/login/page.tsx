"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    // Lleva al destino solicitado; refresh para que el servidor lea la sesión.
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl tracking-wide text-accent">
            SUPER BOWLING
          </p>
          <p className="mt-1 text-sm text-muted">Panel de administración</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-brand border border-line bg-surface p-6 shadow-[var(--shadow-glow)]"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-muted">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-muted">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-ink transition hover:bg-accent-2 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Acceso solo para el equipo de Super Bowling.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
