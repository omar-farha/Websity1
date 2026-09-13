-- Run this in the Supabase SQL editor after 002_client_project_details.sql.
-- Adds the internal "Projects" module (client_projects) and a generic
-- activity_log used across all dashboard modules going forward.

-- ---------------------------------------------------------------------------
-- client_projects
-- ---------------------------------------------------------------------------
create table if not exists client_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid not null references clients(id) on delete cascade,
  website_type text check (website_type in ('portfolio', 'ecommerce', 'dashboard', 'landing_page', 'maintenance', 'other')),
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  due_date date,
  end_date date,
  cost numeric(12, 2),
  paid_amount numeric(12, 2) not null default 0,
  live_url text,
  github_url text,
  figma_url text,
  description text,
  notes text,
  created_at timestamptz not null default now()
);

alter table client_projects enable row level security;

create policy "admin_all_client_projects"
  on client_projects for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- activity_log — generic, append-only, no FK constraints (points at
-- different tables depending on entity_type).
-- ---------------------------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  entity_label text not null,
  action text not null,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "admin_all_activity_log"
  on activity_log for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Backfill: carry over existing client-level financial data (cost/paid) into
-- a client_project row, for any client that has it set. Additive only —
-- does not touch or drop the clients.cost / clients.paid_amount columns.
-- ---------------------------------------------------------------------------
insert into client_projects (client_id, name, website_type, status, start_date, end_date, cost, paid_amount)
select
  id,
  name || '''s project',
  website_type,
  case status when 'completed' then 'completed' else 'in_progress' end,
  start_date,
  end_date,
  cost,
  paid_amount
from clients
where cost is not null or paid_amount <> 0;
