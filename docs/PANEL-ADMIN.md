# Panel de administración — configuración

Guía para conectar la base real (Supabase) y operar el panel. El panel y la web
pública comparten la **misma** base de datos (fuente única de verdad).

## 1. Conectar Supabase

1. En [supabase.com](https://supabase.com) → tu proyecto → **Project Settings → API**.
2. Copia estos valores a `.env.local` (ya creado en la raíz, ignorado por git):
   - `NEXT_PUBLIC_SUPABASE_URL` → *Project URL*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → *anon public*
   - `SUPABASE_SERVICE_ROLE_KEY` → *service_role* (¡secreta, solo servidor!)
3. Reinicia `npm run dev`. En cuanto las tres variables tengan valor, el sistema
   deja el store en memoria y usa Postgres automáticamente (ver
   `src/lib/reservations/store/index.ts`).

## 2. Aplicar las migraciones

Las migraciones viven en `supabase/migrations/`. Aplícalas **en orden**:

### Opción A — SQL Editor (la más simple)
En el panel de Supabase → **SQL Editor** → New query. Pega y ejecuta, una tras otra:
1. El contenido de `supabase/migrations/0001_init.sql`
2. El contenido de `supabase/migrations/0002_admin.sql`

### Opción B — Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref <TU_PROJECT_REF>
npx supabase db push
```

Qué crean:
- **0001** — reservas, franjas con el `UNIQUE` anti-doble-reserva, holds, bloqueos,
  solicitudes de mesa, usuarios admin y las funciones transaccionales.
- **0002** — estado operativo (llegó/no-show/completada), auditoría, función
  `lane_availability` (disponibilidad para web y panel, incluye bloqueos), seed
  de configuración, políticas RLS de lectura para el equipo y realtime.

## 3. Verificar el flujo (sin Wompi todavía)

Con `.env.local` lleno y las migraciones aplicadas, corre `npm run dev` y:

1. **Disponibilidad real:** abre `/reservar/pista`. El mapa de 16 pistas se llena
   desde Postgres (`lane_availability`).
2. **Hold → confirmación:** completa una reserva. El pago aún está simulado: la
   ruta `POST /api/reservar/confirmar` simula el webhook `APPROVED` de Wompi y
   confirma vía `confirm_reservation`. La pista queda `booked` en la base.
3. **Anti-doble-reserva:** `POST /api/reservar/demo-carrera` lanza dos holds
   simultáneos sobre la misma pista/franja; solo uno gana. En Postgres lo impone
   el `UNIQUE(lane_id, slot_date, slot_index)`.
4. **Comprobar en Supabase:** Table Editor → `reservations` debe mostrar la fila
   con `status = confirmed`; `reservation_slots`, sus franjas.

> El estado de pago real (webhooks de Wompi) se integrará cuando llegue la cuenta
> de comercio. Hasta entonces la confirmación es simulada pero **persiste** en la
> base, así que el panel ya muestra datos reales.

## 4. Crear el primer usuario administrador

El panel vive en **`/admin`** (login en `/admin/login`). Solo pueden entrar los
correos registrados en la tabla `admin_users`. Crear un administrador son dos
pasos: crear el usuario en Supabase Auth y registrar su rol.

### Opción A — script (recomendada)
Desde la raíz del proyecto, con `.env.local` ya configurado:

```bash
node scripts/crear-admin.mjs correo@superbowling.co "ContraseñaSegura123" admin
```

El tercer argumento es el rol: `admin` (todo) o `recepcion` (operar reservas,
sin configuración ni usuarios ni reembolsos). El script crea el usuario en Auth
(ya confirmado) y lo registra en `admin_users`. Si el correo ya existía, solo
asegura su rol. Para más usuarios, vuelve a ejecutarlo.

### Opción B — manual desde el panel de Supabase
1. **Authentication → Users → Add user**: crea el usuario con correo y
   contraseña, marca *Auto Confirm User*.
2. **Table Editor → `admin_users` → Insert row**: `email` = el mismo correo,
   `role` = `admin` o `recepcion`.

### Roles
- **admin** — acceso total (incluye configuración, usuarios, reportes y, más
  adelante, reembolsos).
- **recepcion** — operar reservas del día (ver, crear manual, marcar llegada,
  bloquear pista). No ve configuración ni gestión de usuarios.

## 5. Cómo funciona la seguridad

- **Inicio de sesión** con Supabase Auth (correo + contraseña).
- **`src/proxy.ts`** (proxy/middleware de Next 16) refresca la sesión y bloquea
  `/admin` y `/api/admin` sin sesión válida (redirige al login / responde 401).
- **Autorización por rol en el servidor**: el layout del panel y cada acción de
  API llaman `getAdminContext()` / `requireAdmin()` (`src/lib/auth/admin.ts`),
  que consulta el rol en `admin_users`. Ocultar botones en la interfaz no es la
  seguridad: la verdad está en el servidor.
- **RLS** en la base como segunda barrera (migración 0002).
- **Auditoría**: las acciones sensibles se registran en `audit_log` vía
  `logAudit()`.
