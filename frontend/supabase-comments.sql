-- ==========================================================================
-- Civic Echo: Comments Table
-- Run this in your Supabase SQL editor to enable the comment section.
-- ==========================================================================

-- 1. Create the comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  author text not null default 'anonymous',
  content text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table comments enable row level security;

-- 3. Allow anyone to read comments
create policy "Public read comments"
  on comments for select
  using (true);

-- 4. Allow anyone to insert comments
create policy "Public insert comments"
  on comments for insert
  with check (true);

-- 5. Index for faster lookups by report
create index if not exists idx_comments_report_id on comments(report_id);
