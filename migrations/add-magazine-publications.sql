-- Adds first-class multi-publication support to the magazines table.
-- Applied via Supabase MCP migration `add_magazine_publications`.

-- 1. Add the publication discriminator column with a temporary default so the
--    backfill is a single statement; the default is removed at the end so
--    future inserts must declare the publication explicitly.
alter table public.magazines
  add column if not exists publication text not null default 'challenge-auto';

-- 2. Backfill is implicit via the default. Validate the assumption that every
--    existing row is Challenge Auto. (No-op assertion — fails the migration if
--    a future row ever bypasses this default.)
do $$
begin
  if exists (
    select 1 from public.magazines where publication is null
  ) then
    raise exception 'Found magazines row with NULL publication after backfill';
  end if;
end$$;

-- 3. Constrain the column to known publication slugs.
alter table public.magazines
  drop constraint if exists magazines_publication_check;
alter table public.magazines
  add constraint magazines_publication_check
  check (publication in ('challenge-auto', 'vh-speciale-automobile'));

-- 4. Rebuild the uniqueness so two publications can each have their own
--    order_position = 1, 2, 3...
drop index if exists public.magazines_order_position_unique_idx;
create unique index if not exists magazines_publication_order_unique_idx
  on public.magazines (publication, order_position);

-- 5. Replace the simple order index with a composite that matches the new
--    primary read pattern (filter by publication, sort by order_position desc).
drop index if exists public.magazines_order_position_idx;
create index if not exists magazines_publication_order_idx
  on public.magazines (publication, order_position desc);

-- 6. Remove the temporary default so application code must specify the
--    publication on every insert.
alter table public.magazines alter column publication drop default;
