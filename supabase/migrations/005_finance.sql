-- Run this in the Supabase SQL editor after 004_tasks.sql.
-- Extends transactions with payment method and an optional link to a
-- specific project (alongside the existing optional client link).

alter table transactions
  add column if not exists payment_method text,
  add column if not exists client_project_id uuid references client_projects(id) on delete set null;
