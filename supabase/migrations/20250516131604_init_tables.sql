-- supabase/migrations/20250516T130000Z_init_tables.sql

create table public.invitations (
  id           uuid        primary key default gen_random_uuid(),
  email        text        not null,
  phone        text,
  dob          date,
  created_at   timestamp   default now()
  used boolean not null default false,
);

create table public.rsvps (
  id            uuid      primary key default gen_random_uuid(),
  invitation_id uuid      references public.invitations(id) on delete cascade,
  first_name    text      not null,
  last_name     text      not null,
  email         text      not null,
  phone         text,
  dob           date,
  consent       boolean   not null default false,
  confirmed_at  timestamp default now()
);



