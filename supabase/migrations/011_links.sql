-- Run this in the Supabase SQL editor after 010_content_visibility.sql.
-- Adds Files & Links — a simple link organizer per client and/or project
-- (Figma, GitHub, Drive, contracts, etc). Just URLs, no file storage.

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
