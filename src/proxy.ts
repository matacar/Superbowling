/**
 * Proxy (antes "middleware") de acceso al PANEL — convención de Next.js 16.
 *
 * Dos trabajos:
 *  1. Refrescar la sesión de Supabase en cada petición a /admin y /api/admin
 *     (mantiene las cookies de sesión al día).
 *  2. Puerta de entrada: sin sesión válida, /admin redirige a /admin/login y
 *     /api/admin responde 401. La AUTORIZACIÓN FINA POR ROL (admin/recepción)
 *     se valida además en el layout del panel y en cada route handler con
 *     `requireAdmin()` — esto es solo la primera barrera (sesión presente).
 *
 * No bloquea nada fuera de /admin: la web pública y /api/reservar quedan libres.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sin credenciales de Supabase no hay sesiones posibles: deja pasar
  // (entorno demo). El layout del panel mostrará el aviso correspondiente.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANTE: getUser() revalida el token contra Supabase (no confía en la
  // cookie sin más) y de paso refresca la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;
  const isApi = pathname.startsWith("/api/admin");

  if (!user && !isLogin) {
    if (isApi) {
      return NextResponse.json(
        { ok: false, error: "No autenticado." },
        { status: 401 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Ya con sesión, no tiene sentido quedarse en el login.
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
