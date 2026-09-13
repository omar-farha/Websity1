-- Run this in the Supabase SQL editor after 012_expense_management.sql.
-- Adds `leads` — submissions from the public site's contact/start-a-project
-- form. Public visitors can only insert; only the dashboard (via the
-- service-role key, which bypasses RLS) can read, update, or delete.
--
-- Keep the `category` check list in sync with PROJECT_CATEGORIES in
-- app/lib/constants.ts.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  category text not null check (
    category in ('Brands', 'Celebrities', 'Initiatives', 'Gym & Sportswear', 'Systems', 'Clinics')
  ),
  budget text not null,
  monthly_clients text not null,
  timeline text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "public_insert_leads"
  on leads for insert
  with check (true);

create policy "admin_all_leads"
  on leads for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
