-- Run this in the Supabase SQL editor after 011_links.sql.
--
-- Expands expense tracking: richer fields on transactions (vendor,
-- subcategory, recurring flag), plus a separate `subscriptions` table for
-- forward-looking recurring commitments (next payment date, active/
-- cancelled status) — conceptually different from `transactions`, which is
-- a ledger of money that has already moved.

alter table transactions
  add column if not exists vendor text,
  add column if not exists subcategory text,
  add column if not exists is_recurring boolean not null default false,
  add column if not exists recurring_interval text check (recurring_interval in ('monthly', 'yearly'));

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  subcategory text,
  vendor text,
  cost numeric(12, 2) not null,
  interval text not null check (interval in ('monthly', 'yearly')),
  payment_method text,
  start_date date not null default current_date,
  next_payment_date date not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  notes text,
  client_id uuid references clients(id) on delete set null,
  client_project_id uuid references client_projects(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "admin_all_subscriptions"
  on subscriptions for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
