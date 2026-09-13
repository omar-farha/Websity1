-- Run this in the Supabase SQL editor after 005_finance.sql.
--
-- The one place in this schema that gets real Postgres functions instead of
-- plain inserts/updates: recording a client payment must update the
-- project's paid_amount AND create exactly one income transaction, in one
-- atomic step, so the two numbers can never drift apart or get entered
-- twice. Editing/deleting an existing payment goes through the matching
-- function so paid_amount stays in sync in both directions.

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
