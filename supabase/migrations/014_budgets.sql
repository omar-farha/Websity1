-- Run this in the Supabase SQL editor after 013_leads.sql.
-- Adds `budgets` — a monthly spending cap per expense category (Marketing,
-- Subscriptions, People, etc. — the same labels as EXPENSE_GROUPS in
-- app/dashboard/(shell)/finance/types.ts). One row per category; actual
-- spend is computed on the fly from `transactions`, not stored here.

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  monthly_limit numeric(12, 2) not null check (monthly_limit >= 0),
  created_at timestamptz not null default now()
);

alter table budgets enable row level security;

create policy "admin_all_budgets"
  on budgets for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
