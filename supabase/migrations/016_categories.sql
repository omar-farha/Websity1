-- Run this in the Supabase SQL editor after 015_lead_notes.sql.
-- Turns the project/lead category list from a fixed set hardcoded in the
-- app into an admin-managed table, so new categories (e.g. "Gym", another
-- brand vertical) can be added from the dashboard without a code change.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "public_read_categories"
  on categories for select
  using (true);

create policy "admin_write_categories"
  on categories for insert
  with check (auth.uid() is not null);

create policy "admin_update_categories"
  on categories for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "admin_delete_categories"
  on categories for delete
  using (auth.uid() is not null);

-- Seed with the categories already in use, so nothing on the live site
-- changes until the admin edits this list.
insert into categories (name, sort_order) values
  ('Brands', 0),
  ('Celebrities', 1),
  ('Initiatives', 2),
  ('Gym & Sportswear', 3),
  ('Systems', 4),
  ('Clinics', 5)
on conflict (name) do nothing;

-- `leads.category` was locked to that fixed list via a check constraint —
-- drop it now that the valid set is admin-editable at runtime instead.
alter table leads drop constraint if exists leads_category_check;
