-- ============================================================================
-- Super Bowling Medellín — Esquema de reservas (Opción C: backend + pagos)
-- Postgres / Supabase.
--
-- GARANTÍA ANTI-DOBLE-RESERVA (requisito 7.4, innegociable):
--   La tabla `reservation_slots` tiene una restricción UNIQUE sobre
--   (lane_id, slot_date, slot_index). Cada franja ocupada por una reserva
--   ACTIVA (hold / pending_payment / confirmed) tiene exactamente una fila.
--   El motor de la base de datos RECHAZA físicamente un segundo intento de
--   ocupar la misma pista+fecha+franja, incluso con dos pagos simultáneos.
--   No es lógica de aplicación: es el constraint quien lo impide.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Tipos ──────────────────────────────────────────────────────────────────
do $$ begin
  create type reservation_status as enum
    ('hold', 'pending_payment', 'confirmed', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── Configuración operativa (editable desde el panel admin en F4) ───────────
create table if not exists settings (
  id          int primary key default 1,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ── Reservas ────────────────────────────────────────────────────────────────
create table if not exists reservations (
  id                    uuid primary key default gen_random_uuid(),
  lane_id               int  not null,
  reservation_date      date not null,
  start_slot            int  not null,
  turns                 int  not null check (turns >= 1),
  players               int  not null check (players >= 1),
  customer              jsonb not null,
  status                reservation_status not null default 'hold',
  hold_expires_at       timestamptz,
  amount_total          bigint not null,   -- COP (sin centavos)
  amount_deposit        bigint not null,   -- COP (anticipo)
  currency              text not null default 'COP',
  reference             text not null unique,
  wompi_transaction_id  text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_res_date     on reservations (reservation_date);
create index if not exists idx_res_status    on reservations (status, hold_expires_at);
create index if not exists idx_res_reference on reservations (reference);

-- ── Franjas ocupadas: AQUÍ vive la garantía de unicidad ─────────────────────
create table if not exists reservation_slots (
  reservation_id  uuid not null references reservations(id) on delete cascade,
  lane_id         int  not null,
  slot_date       date not null,
  slot_index      int  not null,
  constraint uq_lane_date_slot unique (lane_id, slot_date, slot_index) -- ← clave
);
create index if not exists idx_slots_lookup on reservation_slots (slot_date, lane_id);

-- ── Bloqueos manuales (mantenimiento / eventos) ─────────────────────────────
create table if not exists blocks (
  id          uuid primary key default gen_random_uuid(),
  lane_id     int  not null,
  block_date  date not null,
  start_slot  int  not null,
  turns       int  not null check (turns >= 1),
  reason      text,
  created_at  timestamptz not null default now()
);

-- ── Solicitudes de mesa (restaurante, sin pago) ─────────────────────────────
create table if not exists table_requests (
  id          uuid primary key default gen_random_uuid(),
  request_date date not null,
  request_time text not null,
  people      int  not null,
  zone        text,
  customer    jsonb not null,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);

-- ── Usuarios admin (roles) ──────────────────────────────────────────────────
create table if not exists admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text not null default 'recepcion' check (role in ('admin','recepcion')),
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- FUNCIONES TRANSACCIONALES
-- ============================================================================

-- Libera holds vencidos: marca la reserva como `expired` y borra sus franjas
-- (lo que las vuelve a dejar disponibles). El pago confirmado nunca expira.
create or replace function expire_holds() returns int as $$
declare expired_count int;
begin
  with expired as (
    update reservations
       set status = 'expired', hold_expires_at = null
     where status in ('hold','pending_payment')
       and hold_expires_at is not null
       and hold_expires_at < now()
    returning id
  )
  delete from reservation_slots s using expired e where s.reservation_id = e.id;
  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$ language plpgsql;

-- Crea un HOLD de forma atómica. Primero libera vencidos; luego inserta la
-- reserva y sus franjas. Si alguna franja ya está ocupada, el UNIQUE dispara
-- unique_violation y toda la operación se revierte → devuelve lane_taken.
create or replace function create_hold(
  p_lane_id     int,
  p_date        date,
  p_start_slot  int,
  p_turns       int,
  p_players     int,
  p_customer    jsonb,
  p_amount_total   bigint,
  p_amount_deposit bigint,
  p_reference   text,
  p_hold_minutes int
) returns jsonb as $$
declare
  v_id uuid;
  v_slot int;
begin
  perform expire_holds();

  insert into reservations (
    lane_id, reservation_date, start_slot, turns, players, customer,
    status, hold_expires_at, amount_total, amount_deposit, currency, reference
  ) values (
    p_lane_id, p_date, p_start_slot, p_turns, p_players, p_customer,
    'hold', now() + make_interval(mins => p_hold_minutes),
    p_amount_total, p_amount_deposit, 'COP', p_reference
  ) returning id into v_id;

  -- una fila por franja ocupada → el UNIQUE garantiza no-solape
  for v_slot in p_start_slot .. (p_start_slot + p_turns - 1) loop
    insert into reservation_slots (reservation_id, lane_id, slot_date, slot_index)
    values (v_id, p_lane_id, p_date, v_slot);
  end loop;

  return jsonb_build_object('ok', true, 'id', v_id, 'reference', p_reference);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'lane_taken');
end;
$$ language plpgsql;

-- Confirma una reserva (anticipo aprobado). Idempotente.
create or replace function confirm_reservation(
  p_reference text,
  p_tx_id     text
) returns jsonb as $$
declare r reservations%rowtype;
begin
  select * into r from reservations where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if r.status = 'confirmed' then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;

  -- Si el hold expiró y sus franjas se borraron, reintenta re-ocuparlas.
  -- Si otra reserva ya las tomó, el UNIQUE falla → requiere reembolso.
  begin
    insert into reservation_slots (reservation_id, lane_id, slot_date, slot_index)
    select r.id, r.lane_id, r.reservation_date, gs
      from generate_series(r.start_slot, r.start_slot + r.turns - 1) gs
     where not exists (
       select 1 from reservation_slots s
        where s.reservation_id = r.id and s.slot_index = gs
     );
  exception when unique_violation then
    update reservations set status='cancelled', wompi_transaction_id=p_tx_id
     where id = r.id;
    return jsonb_build_object('ok', false, 'reason', 'conflict_refund_required');
  end;

  update reservations
     set status='confirmed', hold_expires_at=null, wompi_transaction_id=p_tx_id
   where id = r.id;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql;

-- Libera una reserva (pago fallido / cancelación). Idempotente.
create or replace function release_reservation(
  p_reference text,
  p_reason    text  -- 'expired' | 'cancelled'
) returns jsonb as $$
declare r reservations%rowtype;
begin
  select * into r from reservations where reference = p_reference for update;
  if not found then return jsonb_build_object('ok', false, 'reason','not_found'); end if;
  if r.status = 'confirmed' and p_reason = 'expired' then
    return jsonb_build_object('ok', true, 'noop', true);
  end if;
  delete from reservation_slots where reservation_id = r.id;
  update reservations set status = p_reason::reservation_status, hold_expires_at=null
   where id = r.id;
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql;

-- ============================================================================
-- SEGURIDAD (RLS). El acceso pasa siempre por el service role del backend.
-- ============================================================================
alter table reservations      enable row level security;
alter table reservation_slots enable row level security;
alter table blocks            enable row level security;
alter table table_requests    enable row level security;
alter table admin_users       enable row level security;
alter table settings          enable row level security;
-- (Sin políticas públicas: solo el service role del servidor puede leer/escribir.
--  Las políticas finas para el panel admin se añaden en la Fase 4.)
