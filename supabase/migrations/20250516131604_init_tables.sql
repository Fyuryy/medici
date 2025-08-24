-- supabase/migrations/20250516T130000Z_init_tables.sql

create table public.invitations (
  id           uuid        primary key default gen_random_uuid(),
  email        text        not null,
  phone        text,
  created_at   timestamp   default now(),
  used         boolean     not null default false
);

create table public.rsvps (
  id            uuid      primary key default gen_random_uuid(),
  invitation_id uuid      references public.invitations(id) on delete cascade,
  consent       boolean   not null default false,
  created_at    timestamp default now()
);



