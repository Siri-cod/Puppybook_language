-- Run once in Supabase: SQL Editor → New query → Run
--
-- One database for everyone. The app derives notebook_id from two passwords
-- client-side (SHA-256). Rows with different notebook_id values are isolated.
-- RLS allows any non-empty notebook_id; security relies on unguessable vault ids.

create table if not exists entries (
  id text primary key,
  notebook_id text not null,
  data jsonb not null,
  updated_at bigint not null default 0
);

create index if not exists entries_notebook_id on entries (notebook_id);

alter table entries enable row level security;

drop policy if exists "puppy_book_notebook" on entries;

-- Allow anonymous clients to read/write rows for any non-empty notebook_id.
-- Security comes from notebook_id being a long, secret string per group.
create policy "puppy_book_notebook"
  on entries
  for all
  to anon
  using (notebook_id is not null and length(notebook_id) > 0)
  with check (notebook_id is not null and length(notebook_id) > 0);
