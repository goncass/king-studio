-- ============================================
-- KingsStudio 2020 - Supabase Schema (SAFE VERSION)
-- Run this in Supabase SQL Editor - safe to run multiple times
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE (replaces user-store.ts)
-- ============================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  name text not null,
  role text check (role in ('admin','barber')) not null default 'barber',
  password_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for username lookups (login)
create index if not exists idx_users_username on users(username);

-- ============================================
-- BOOKINGS TABLE (replaces bookingsStore)
-- ============================================
create table if not exists bookings (
  id text primary key, -- KS-timestamp format
  service_id text not null,
  barber_name text not null,
  date date not null,
  time time not null,
  duration_minutes int not null,
  client_name text not null,
  client_phone text not null,
  client_email text,
  notes text,
  status text check (status in ('pending','confirmed','completed','cancelled')) default 'confirmed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for query performance
create index if not exists idx_bookings_barber_date on bookings(barber_name, date);
create index if not exists idx_bookings_date_status on bookings(date, status);
create index if not exists idx_bookings_client_phone on bookings(client_phone);
create index if not exists idx_bookings_created_at on bookings(created_at desc);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table if exists bookings enable row level security;
alter table if exists users enable row level security;

-- Drop existing policies first (safe to run multiple times)
drop policy if exists "Admin full access users" on users;
drop policy if exists "User can view own profile" on users;
drop policy if exists "Admin full access bookings" on bookings;
drop policy if exists "Barber own bookings select" on bookings;

-- Users: admin sees all, users see only themselves (for profile)
create policy "Admin full access users" on users
  for all using (
    exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "User can view own profile" on users
  for select using (id = auth.uid());

-- Bookings: admin sees all, barber sees own
create policy "Admin full access bookings" on bookings
  for all using (
    exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Barber own bookings select" on bookings
  for select using (
    barber_name = (select name from users where id = auth.uid())
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get occupied 30-min slots for a booking (used in overlap check)
create or replace function get_occupied_slots(
  p_time time,
  p_duration_minutes int
) returns text[] language plpgsql as $$
declare
  v_start_minutes int;
  v_end_minutes int;
  v_slots text[];
  v_slot text;
  v_h int;
  v_m int;
begin
  v_start_minutes := extract(hour from p_time)::int * 60 + extract(minute from p_time)::int;
  v_end_minutes := v_start_minutes + p_duration_minutes;
  v_slots := array[]::text[];

  for i in 0..((v_end_minutes - v_start_minutes - 1) / 30) loop
    v_h := ((v_start_minutes + i * 30) / 60)::int;
    v_m := ((v_start_minutes + i * 30) % 60)::int;
    v_slot := lpad(v_h::text, 2, '0') || ':' || lpad(v_m::text, 2, '0');
    v_slots := array_append(v_slots, v_slot);
  end loop;

  return v_slots;
end;
$$;

-- Check if a new booking overlaps with existing bookings
create or replace function check_booking_overlap(
  p_barber_name text,
  p_date date,
  p_time time,
  p_duration_minutes int,
  p_exclude_id text default null
) returns boolean language plpgsql as $$
declare
  v_new_slots text[];
  v_overlap boolean := false;
begin
  v_new_slots := get_occupied_slots(p_time, p_duration_minutes);

  -- Check for overlaps using array overlap operator &&
  select exists (
    select 1 from bookings b
    where b.barber_name = p_barber_name
      and b.date = p_date
      and b.status != 'cancelled'
      and (p_exclude_id is null or b.id != p_exclude_id)
      and get_occupied_slots(b.time, b.duration_minutes) && v_new_slots
  ) into v_overlap;

  return v_overlap;
end;
$$;

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_users_updated_at on users;
drop trigger if exists update_bookings_updated_at on bookings;

create trigger update_users_updated_at
  before update on users
  for each row execute function update_updated_at_column();

create trigger update_bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at_column();

-- ============================================
-- SEED DATA (safe - only inserts if not exists)
-- ============================================
-- Passwords are bcrypt hashes (12 rounds)
-- admin / kings2020
-- ruben / king2020
-- bruno / ricardo2020
-- vitor / miguel2020
-- nuno / miguel2020

insert into users (username, name, role, password_hash) values
  ('admin', 'Admin', 'admin', '$2b$12$4lFtG3S0rFAMUlO55hbqYeeh.MWbDK4Mw60VP8iDPHI7DCg20aKvO'),
  ('ruben', 'Ruben', 'barber', '$2b$12$xfleH307yaK0nUcUo604jOdrF9hTekuqE.v/ftrGCM.xdkmopORqu'),
  ('bruno', 'Bruno', 'barber', '$2b$12$SQbhn3QvGZmHAFGJjoA2y.1mzl0nt/rLXwbIS.PPA1nWHtvTPXLNa'),
  ('vitor', 'Vitor', 'barber', '$2b$12$VEFaYSmpRWUB6gGbcy3rwOtpHghqs2nmj8DZvlGsRgI604T640Rn2'),
  ('nuno', 'Nuno', 'barber', '$2b$12$mKL466CqjL4I5BcTk7vkae5aEjzVpJMPi0ryRyTixKd.c1uGo9Lbi')
on conflict (username) do nothing;

-- Demo bookings (updated barber names)
insert into bookings (id, service_id, barber_name, date, time, duration_minutes, client_name, client_phone, client_email, notes, status) values
  ('KS-1704067200001', 'corte-barba', 'Nuno', '2024-12-15', '10:00', 60, 'João Silva', '915 271 491', 'joao@email.com', 'Prefere fade baixo', 'confirmed'),
  ('KS-1704067200002', 'fade-cut', 'Ruben', '2024-12-15', '11:30', 45, 'Miguel Santos', '912 345 678', '', '', 'pending'),
  ('KS-1704067200003', 'navalha-quente', 'Nuno', '2024-12-14', '14:30', 35, 'Pedro Costa', '918 765 432', 'pedro@email.com', 'Pele sensível', 'completed'),
  ('KS-1704067200004', 'corte-crianca', 'Bruno', '2024-12-16', '11:00', 30, 'André Ferreira', '913 456 789', '', 'Primeiro corte do filho (8 anos)', 'confirmed'),
  ('KS-1704067200005', 'colocacao-cor', 'Vitor', '2024-12-16', '15:30', 90, 'Rui Martins', '917 890 123', 'rui@email.com', 'Cobrir brancos - tom natural', 'pending')
on conflict (id) do nothing;

-- ============================================
-- VERIFICATION QUERIES (run these after to confirm)
-- ============================================
-- Check users
-- select * from users;

-- Check bookings
-- select * from bookings order by date, time;

-- Test overlap function
-- select check_booking_overlap('Nuno', '2024-12-15', '10:00', 60); -- should be true (conflicts with KS-1704067200001)
-- select check_booking_overlap('Nuno', '2024-12-15', '12:00', 60); -- should be false (no conflict)