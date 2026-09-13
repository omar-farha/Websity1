-- Run this in the Supabase SQL editor (Project already has schema.sql applied).
-- Adds a CRM-style status to clients.

alter table clients
  add column if not exists status text not null default 'lead'
  check (status in ('lead', 'active', 'completed', 'archived'));
