-- Run this in the Supabase SQL editor after 016_categories.sql.
-- Every "Add" action in the dashboard (Portfolio, FAQs, Approach,
-- Categories) previously left new rows at the sort_order column's default
-- of 0 instead of assigning a real position. With more than one row tied
-- at 0, the up/down reorder buttons swapped nothing (both stayed at 0) and
-- the on-screen order became whatever Postgres happened to return that
-- request — which looked like "sometimes the arrows work, sometimes they
-- don't". This renumbers every table sequentially, breaking ties by
-- creation time, so every row gets a distinct position going forward.
-- (The app code is also fixed to assign a real sort_order on every future
-- insert, so this should only ever need to run once.)

with ranked as (
  select id, row_number() over (order by sort_order, created_at) - 1 as new_order
  from projects
)
update projects set sort_order = ranked.new_order
from ranked where projects.id = ranked.id;

with ranked as (
  select id, row_number() over (order by sort_order, created_at) - 1 as new_order
  from faqs
)
update faqs set sort_order = ranked.new_order
from ranked where faqs.id = ranked.id;

with ranked as (
  select id, row_number() over (order by sort_order, created_at) - 1 as new_order
  from approach_steps
)
update approach_steps set sort_order = ranked.new_order
from ranked where approach_steps.id = ranked.id;

with ranked as (
  select id, row_number() over (order by sort_order, created_at) - 1 as new_order
  from categories
)
update categories set sort_order = ranked.new_order
from ranked where categories.id = ranked.id;
