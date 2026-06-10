-- ============================================================================
-- Super Bowling Medellín — Migración 0002: panel de administración
--
-- Añade lo que el panel necesita SIN romper el esquema de 0001:
--   1. Estado operativo de la reserva (llegó / no-show / completada).
--   2. Registro de auditoría de acciones sensibles.
--   3. Función única de disponibilidad (reservas + bloqueos) para web y panel.
--   4. Seed de la configuración operativa (espejo de settings.ts).
--   5. Políticas RLS para que el equipo (admin/recepción) lea desde el panel.
--   6. Realtime: las reservas y bloqueos nuevos llegan solos al panel.
-- ============================================================================

-- ── 1. Estado operativo (independiente del estado de pago) ──────────────────
do $$ begin
  create type op_status as enum
    ('pendiente_llegada', 'llego', 'no_show', 'completada');
exception when duplicate_object then null; end $$;

alter table reservations
  add column if not exists op_status op_status not null default 'pendiente_llegada';

-- ── 2. Auditoría de acciones sensibles (sección 3 del requisito) ────────────
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_email text,
  actor_role  text,
  action      text not null,   -- crear_manual | cancelar | bloquear | desbloquear
                               -- | marcar_estado | editar | reembolso_manual
  target_type text,            -- reservation | block | lane | settings
  target_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_log (created_at desc);

-- ── 3. Disponibilidad: FUENTE ÚNICA para la web pública y el panel ──────────
-- Devuelve solo las pistas NO libres en [p_start, p_start+p_turns):
--   'blocked' (mantenimiento/evento) tiene prioridad; luego 'booked'
--   (confirmada) sobre 'held' (hold / pago en curso). El resto, libres.
create or replace function lane_availability(p_date date, p_start int, p_turns int)
returns table(lane_id int, status text)
language sql stable
as $$
  with occ as (
    select rs.lane_id, r.status::text as st
      from reservation_slots rs
      join reservations r on r.id = rs.reservation_id
     where rs.slot_date = p_date
       and rs.slot_index >= p_start
       and rs.slot_index <  p_start + p_turns
  ),
  blk as (
    select distinct b.lane_id
      from blocks b
     where b.block_date = p_date
       and b.start_slot < p_start + p_turns      -- solape de rangos de franjas
       and p_start      < b.start_slot + b.turns
  )
  select b.lane_id, 'blocked'::text from blk b
  union all
  select o.lane_id,
         case when bool_or(o.st = 'confirmed') then 'booked' else 'held' end
    from occ o
   where o.lane_id not in (select lane_id from blk)
   group by o.lane_id;
$$;

-- ── 4. Seed de configuración operativa (espejo de src/lib/reservations/settings.ts)
-- Idempotente: solo inserta si no existe. Editar luego desde el panel (F-C).
insert into settings (id, data) values (
  1,
  '{
    "venue":   { "laneCount": 16, "maxPlayersPerLane": 6 },
    "turn":    { "durationMinutes": 60, "minTurns": 1, "maxTurns": 3 },
    "pricing": { "currency": "COP", "pricePerTurn": 70000 },
    "deposit": { "mode": "percent", "value": 50 },
    "booking": { "minAdvanceHours": 2, "holdMinutes": 10, "horizonDays": 21 },
    "hours": {
      "mon": { "open": "15:00", "close": "23:59" },
      "tue": { "open": "15:00", "close": "23:59" },
      "wed": { "open": "15:00", "close": "23:59" },
      "thu": { "open": "15:00", "close": "23:59" },
      "fri": { "open": "15:00", "close": "23:59" },
      "sat": { "open": "12:00", "close": "24:00" },
      "sun": null
    }
  }'::jsonb
)
on conflict (id) do nothing;

-- ============================================================================
-- 5. SEGURIDAD A NIVEL DE BASE (RLS) PARA EL PANEL
--
-- El backend del panel opera con la SERVICE ROLE (omite RLS) tras validar la
-- sesión y el rol en el servidor. Estas políticas son la SEGUNDA barrera: con
-- el cliente autenticado del navegador (clave anon + JWT del usuario), solo
-- quien esté en `admin_users` puede LEER. Es lo que habilita el realtime del
-- panel sin abrir los datos a cualquiera. Las ESCRITURAS pasan por el servidor.
-- ============================================================================

-- ¿El usuario autenticado actual está registrado como admin/recepción?
-- security definer → puede consultar admin_users aunque tenga RLS.
create or replace function is_admin_user()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from admin_users
     where email = (select auth.jwt() ->> 'email')
  );
$$;

-- Rol del usuario autenticado actual ('admin' | 'recepcion' | null).
create or replace function admin_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from admin_users
   where email = (select auth.jwt() ->> 'email');
$$;

-- Lectura para el equipo autenticado en cada tabla operativa.
do $$
declare t text;
begin
  foreach t in array array[
    'reservations', 'reservation_slots', 'blocks',
    'table_requests', 'settings', 'audit_log'
  ] loop
    execute format('drop policy if exists admin_read on %I', t);
    execute format(
      'create policy admin_read on %I for select to authenticated using (is_admin_user())',
      t
    );
  end loop;
end $$;

-- audit_log no tenía RLS activado (lo crea esta migración): actívalo.
alter table audit_log enable row level security;

-- ============================================================================
-- 6. REALTIME — el panel recibe reservas y bloqueos nuevos sin recargar.
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table reservations;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table blocks;
exception when duplicate_object then null; end $$;
