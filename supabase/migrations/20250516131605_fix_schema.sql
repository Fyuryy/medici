-- Fix the invitations table syntax error
ALTER TABLE public.invitations DROP COLUMN IF EXISTS dob;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS event_id uuid;

-- Drop the old rsvps table and recreate it properly
DROP TABLE IF EXISTS public.rsvps;

-- Create the proper rsvps table
CREATE TABLE public.rsvps (
  id            uuid      primary key default gen_random_uuid(),
  invitation_id uuid      references public.invitations(id) on delete cascade,
  consent       boolean   not null default false,
  created_at    timestamp default now()
);

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid      primary key default gen_random_uuid(),
  rsvp_id       uuid      references public.rsvps(id) on delete cascade,
  name          text      not null,
  email         text      not null unique,
  phone         text,
  date_of_birth date,
  created_at    timestamp default now()
);

-- Create the tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id            uuid      primary key default gen_random_uuid(),
  user_id       uuid      references public.users(id) on delete cascade,
  event_id      uuid      not null,
  invitation_id uuid      references public.invitations(id) on delete cascade,
  session_id    text,
  ticket_code   text      not null unique,
  issued_at     timestamp default now(),
  redeemed_at   timestamp
);

-- Create the admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id            uuid      primary key default gen_random_uuid(),
  created_at    timestamp default now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_session_id ON public.tickets(session_id); 