-- Run this in the Supabase SQL editor after 009_notes_communications.sql.
-- Adds show/hide + featured + gallery support to the public-site content
-- tables, for the "Website Content Management" dashboard section.

alter table projects
  add column if not exists is_visible boolean not null default true,
  add column if not exists featured boolean not null default false,
  add column if not exists gallery_urls text[] not null default '{}';

alter table services
  add column if not exists is_visible boolean not null default true;

alter table faqs
  add column if not exists is_visible boolean not null default true;

alter table approach_steps
  add column if not exists is_visible boolean not null default true;
