-- Run this in the Supabase SQL editor after 001_add_client_status.sql.
-- Adds project timeline, website type, and simple cost/payment tracking to clients.

alter table clients
  add column if not exists start_date date not null default current_date,
  add column if not exists end_date date,
  add column if not exists website_type text
    check (website_type in ('portfolio', 'ecommerce', 'dashboard', 'landing_page', 'maintenance', 'other')),
  add column if not exists cost numeric(12, 2),
  add column if not exists paid_amount numeric(12, 2) not null default 0;
