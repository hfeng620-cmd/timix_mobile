create table if not exists public.forum_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.forum_profiles(id) on delete cascade,
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

create index if not exists forum_bookmarks_user_created_idx
  on public.forum_bookmarks(user_id, created_at desc);

alter table public.forum_bookmarks enable row level security;

drop policy if exists "Users can view own forum bookmarks" on public.forum_bookmarks;
create policy "Users can view own forum bookmarks"
  on public.forum_bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own forum bookmarks" on public.forum_bookmarks;
create policy "Users can create own forum bookmarks"
  on public.forum_bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own forum bookmarks" on public.forum_bookmarks;
create policy "Users can delete own forum bookmarks"
  on public.forum_bookmarks for delete
  using (auth.uid() = user_id);
