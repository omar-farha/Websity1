-- Websity dashboard schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query),
-- then run seed.sql afterwards.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  status text not null default 'lead' check (status in ('lead', 'active', 'completed', 'archived')),
  start_date date not null default current_date,
  end_date date,
  website_type text check (website_type in ('portfolio', 'ecommerce', 'dashboard', 'landing_page', 'maintenance', 'other')),
  cost numeric(12, 2),
  paid_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table clients enable row level security;

create policy "admin_all_clients"
  on clients for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- client_projects — internal work items ("Projects" in the dashboard).
-- Distinct from the public-facing `projects` table below (the site's
-- portfolio/case-studies content, called "Portfolio" in the dashboard).
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
-- activity_log — generic, append-only, powers the dashboard-wide and
-- per-entity "Recent Activity" feeds.
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
-- tasks — optionally linked to a project and/or a client directly.
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_project_id uuid references client_projects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  status text not null default 'to_do' check (status in ('to_do', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "admin_all_tasks"
  on tasks for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- notes — multiple timestamped notes attachable to a client and/or project.
-- Separate from the quick clients.notes / client_projects.notes text field.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- communications — a log of contact touches with a client. Powers Follow-ups.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- links — simple Figma/GitHub/Drive/etc. link organizer per client/project.
-- ---------------------------------------------------------------------------
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  client_project_id uuid references client_projects(id) on delete cascade,
  category text not null check (category in ('figma', 'github', 'drive', 'contracts', 'documents', 'brand', 'images', 'other')),
  label text not null,
  url text not null,
  created_at timestamptz not null default now(),
  constraint links_has_a_parent check (client_id is not null or client_project_id is not null)
);

alter table links enable row level security;

create policy "admin_all_links"
  on links for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- transactions (income & expenses)
-- ---------------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null,
  subcategory text,
  description text,
  occurred_on date not null,
  client_id uuid references clients(id) on delete set null,
  client_project_id uuid references client_projects(id) on delete set null,
  payment_method text,
  vendor text,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval in ('monthly', 'yearly')),
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "admin_all_transactions"
  on transactions for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- subscriptions — forward-looking recurring commitments (next payment date,
-- active/cancelled). Distinct from transactions, which is a ledger of money
-- that has already moved.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- projects (public site content)
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  role text not null,
  year int not null,
  tagline text not null,
  description text not null,
  tags text[] not null default '{}',
  stack text[] not null default '{}',
  image_url text not null,
  live_url text,
  testimonial_name text not null,
  testimonial_role text not null,
  testimonial_rating int not null check (testimonial_rating between 1 and 5),
  testimonial_quote text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  featured boolean not null default false,
  gallery_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "public_read_projects"
  on projects for select
  using (true);

create policy "admin_write_projects"
  on projects for insert
  with check (auth.uid() is not null);

create policy "admin_update_projects"
  on projects for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "admin_delete_projects"
  on projects for delete
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- services (public site content)
-- ---------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  description text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "public_read_services"
  on services for select
  using (true);

create policy "admin_write_services"
  on services for insert
  with check (auth.uid() is not null);

create policy "admin_update_services"
  on services for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "admin_delete_services"
  on services for delete
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- faqs (public site content)
-- ---------------------------------------------------------------------------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table faqs enable row level security;

create policy "public_read_faqs"
  on faqs for select
  using (true);

create policy "admin_write_faqs"
  on faqs for insert
  with check (auth.uid() is not null);

create policy "admin_update_faqs"
  on faqs for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "admin_delete_faqs"
  on faqs for delete
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- approach_steps (public site content)
-- ---------------------------------------------------------------------------
create table if not exists approach_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_name text not null default '',
  icon text not null,
  icon_bg text not null default '#0fd8d7',
  date_label text not null default 'Stage',
  points text[] not null default '{}',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table approach_steps enable row level security;

create policy "public_read_approach_steps"
  on approach_steps for select
  using (true);

create policy "admin_write_approach_steps"
  on approach_steps for insert
  with check (auth.uid() is not null);

create policy "admin_update_approach_steps"
  on approach_steps for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "admin_delete_approach_steps"
  on approach_steps for delete
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- leads — submissions from the public site's contact/start-a-project form.
-- Public visitors can only insert; only the dashboard (service-role key,
-- bypasses RLS) can read, update, or delete. `category` is free text
-- validated at the application layer against the admin-managed `categories`
-- table below (see supabase/migrations/016_categories.sql).
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  category text not null,
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

-- ---------------------------------------------------------------------------
-- budgets — a monthly spending cap per expense category. One row per
-- category; actual spend is computed on the fly from `transactions`.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- notes can also attach to a lead (in addition to a client/client_project
-- above) — added after `leads` so the foreign key can resolve on a fresh
-- install run top-to-bottom.
-- ---------------------------------------------------------------------------
alter table notes add column if not exists lead_id uuid references leads(id) on delete cascade;

alter table notes drop constraint if exists notes_has_a_parent;

alter table notes add constraint notes_has_a_parent
  check (client_id is not null or client_project_id is not null or lead_id is not null);

-- ---------------------------------------------------------------------------
-- record_payment / update_payment / delete_payment — the one place in this
-- schema with real Postgres functions instead of plain inserts/updates.
-- Recording a client payment must update the project's paid_amount AND
-- create exactly one income transaction atomically, so the two numbers can
-- never drift apart or get entered twice.
-- ---------------------------------------------------------------------------
create or replace function record_payment(
  p_client_project_id uuid,
  p_amount numeric,
  p_occurred_on date,
  p_payment_method text,
  p_description text
) returns uuid
language plpgsql
as $$
declare
  v_client_id uuid;
  v_transaction_id uuid;
begin
  select client_id into v_client_id from client_projects where id = p_client_project_id;
  if v_client_id is null then
    raise exception 'Project not found';
  end if;

  update client_projects
  set paid_amount = paid_amount + p_amount
  where id = p_client_project_id;

  insert into transactions (type, amount, category, description, occurred_on, client_id, client_project_id, payment_method)
  values ('income', p_amount, 'Client Payment', p_description, p_occurred_on, v_client_id, p_client_project_id, p_payment_method)
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

create or replace function update_payment(
  p_transaction_id uuid,
  p_amount numeric,
  p_occurred_on date,
  p_payment_method text,
  p_description text
) returns void
language plpgsql
as $$
declare
  v_old_amount numeric;
  v_client_project_id uuid;
begin
  select amount, client_project_id into v_old_amount, v_client_project_id
  from transactions where id = p_transaction_id;

  if v_client_project_id is null then
    raise exception 'Not a project payment';
  end if;

  update client_projects
  set paid_amount = paid_amount - v_old_amount + p_amount
  where id = v_client_project_id;

  update transactions
  set amount = p_amount, occurred_on = p_occurred_on, payment_method = p_payment_method, description = p_description
  where id = p_transaction_id;
end;
$$;

create or replace function delete_payment(p_transaction_id uuid)
returns void
language plpgsql
as $$
declare
  v_amount numeric;
  v_client_project_id uuid;
begin
  select amount, client_project_id into v_amount, v_client_project_id
  from transactions where id = p_transaction_id;

  if v_client_project_id is not null then
    update client_projects
    set paid_amount = paid_amount - v_amount
    where id = v_client_project_id;
  end if;

  delete from transactions where id = p_transaction_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- storage bucket for project images uploaded later from the dashboard
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "public_read_project_images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "admin_write_project_images"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "admin_update_project_images"
  on storage.objects for update
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "admin_delete_project_images"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- categories — the admin-managed business types (Brands, Gym & Sportswear,
-- Clinics…) used to filter the public projects showcase and tag leads.
-- Publicly readable so the site's contact form and projects filter can read
-- it directly; only the dashboard (service-role key) can write to it.
-- ---------------------------------------------------------------------------
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

insert into categories (name, sort_order) values
  ('Brands', 0),
  ('Celebrities', 1),
  ('Initiatives', 2),
  ('Gym & Sportswear', 3),
  ('Systems', 4),
  ('Clinics', 5)
on conflict (name) do nothing;
