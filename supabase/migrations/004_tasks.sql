-- Run this in the Supabase SQL editor after 003_client_projects.sql.
-- Adds the Tasks module — each task can optionally link to a project and/or
-- a client directly (a task doesn't have to belong to a project).

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
