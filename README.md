# Super Bowling Medellín — Sitio web

Sitio web premium con **reservas de pista en línea** para Super Bowling Medellín
(16 pistas, restaurante y bar en Envigado). Reemplaza el sitio actual de
WordPress por una experiencia moderna, rápida y con reservas + pago real.

> **Estado actual: Fase 0 — Cimientos** ✅
> Proyecto base, sistema de diseño (tokens), navegación fija con CTA persistente,
> footer global y Home placeholder. Las siguientes fases añaden el sitio de
> marketing, el sistema de reservas con maqueta de pistas, los pagos con Wompi y
> el panel de administración.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design tokens CSS-first) + **Framer Motion**
- _Próximas fases:_ **Supabase** (reservas/admin) · **Wompi** (pagos) · **Resend** (emails)

## Requisitos

- Node.js 20+ (probado en v24)
- npm 10+

## Instalación y ejecución

```bash
npm install            # instala dependencias
cp .env.example .env.local   # (Windows: copy .env.example .env.local)
npm run dev            # http://localhost:3000
```

Scripts disponibles:

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter |

## Estructura

```
src/
  app/
    layout.tsx        # layout raíz: fuentes, SEO, navbar + footer + CTA flotante
    page.tsx          # Home (placeholder F0)
    globals.css       # ← DESIGN TOKENS centralizados (colores, fuentes, estados)
  components/
    Navbar.tsx        # navegación fija + menú móvil + CTA "Reservar"
    Footer.tsx        # footer global (contacto, redes, sedes del grupo)
    FloatingReserve.tsx  # CTA de reserva flotante en móvil
  lib/
    site.ts           # ← DATOS centralizados (marca, contacto, horarios, nav)
public/
  assets/             # logo, fotos, video reales (pendientes del cliente)
```

## Personalización rápida

- **Colores / tipografías:** `src/app/globals.css` (bloque `@theme`). El acento
  y la fuente display están como `[POR CONFIRMAR]` hasta tener el logo oficial.
- **Datos del negocio** (contacto, horarios, redes, nº de pistas):
  `src/lib/site.ts`.

## Datos pendientes del cliente

- Horarios y **precio por hora/pista** reales (hoy hay referencias del sector).
- Reglas de reserva (anticipación, cancelación/reembolso, tolerancia).
- **Assets** reales (ver `public/assets/README.md`).
- Credenciales de **Supabase**, **Wompi** (sandbox primero) y **Resend** (`.env.local`).

## Despliegue (recomendado)

- **Frontend:** Vercel (deploy directo desde el repo).
- **Backend de reservas:** Supabase (Postgres + Auth + Realtime).
- Configurar las variables de `.env.example` en el panel de Vercel.

## Roadmap

| Fase | Contenido | Estado |
|---|---|---|
| F0 | Cimientos (este entregable) | ✅ |
| F1 | Marketing: Home, Nosotros, Carta, Eventos, Contacto | ⏳ |
| F2 | Reservas: maqueta de 16 pistas + flujo guiado | ⏳ |
| F3 | Pagos Wompi + bloqueo anti-doble-reserva + emails | ⏳ |
| F4 | Panel de administración | ⏳ |
| F5 | Pulido, SEO avanzado y despliegue | ⏳ |
