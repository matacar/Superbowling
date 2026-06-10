"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-cream disabled:opacity-50"
      }
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
