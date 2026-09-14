-- Run this in the Supabase SQL editor after 014_budgets.sql.
-- Lets `notes` also attach to a lead, reusing the same notes/comments
-- system already used for clients and client_projects.

alter table notes add column if not exists lead_id uuid references leads(id) on delete cascade;

alter table notes drop constraint if exists notes_has_a_parent;

alter table notes add constraint notes_has_a_parent
  check (client_id is not null or client_project_id is not null or lead_id is not null);
