-- Run this in the Supabase SQL editor after 007_backfill_untracked_payments.sql
-- (008_leads.sql was removed — Leads was built then dropped this session).
--
-- Adds two things:
--  - notes: multiple timestamped notes attachable to a client and/or project
--    (separate from the existing quick clients.notes / client_projects.notes
--    free-text field — this is a real history, not a single note).
--  - communications: a log of contact touches with a client, each optionally
--    carrying its own next-follow-up date. Powers the Follow-ups page.

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  client_project_id uuid references client_projects(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint notes_has_a_parent check (client_id is not null or client_project_id is not null)
);

alter table notes enable row level security;

create policy "admin_all_notes"
  on notes for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('whatsapp', 'email', 'call', 'meeting', 'instagram', 'other')),
  notes text,
  contacted_at date not null default current_date,
  next_follow_up_date date,
  created_at timestamptz not null default now()
);

alter table communications enable row level security;

create policy "admin_all_communications"
  on communications for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
