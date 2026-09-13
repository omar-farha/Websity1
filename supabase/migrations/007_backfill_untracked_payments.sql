-- Run this in the Supabase SQL editor after 006_record_payment.sql.
--
-- Fixes a real gap: client_projects.paid_amount for Hany and Omar was set
-- directly by the 003 backfill migration, before record_payment() existed —
-- so that money was never recorded as a transaction, and Finance's income
-- totals silently excluded it. This inserts exactly the untracked
-- difference (paid_amount minus whatever's already a real transaction) as
-- one backfill transaction per project, so Finance and the project's Paid
-- figure finally agree. Safe to run more than once — once a project's gap
-- is filled, it computes as 0 and gets skipped.

insert into transactions (
  type, amount, category, description, occurred_on, client_id, client_project_id, payment_method
)
select
  'income',
  cp.paid_amount - coalesce(t.total, 0),
  'Client Payment',
  'Backfilled — paid before payment tracking existed',
  cp.start_date,
  cp.client_id,
  cp.id,
  null
from client_projects cp
left join (
  select client_project_id, sum(amount) as total
  from transactions
  where client_project_id is not null
  group by client_project_id
) t on t.client_project_id = cp.id
where cp.paid_amount - coalesce(t.total, 0) > 0;
