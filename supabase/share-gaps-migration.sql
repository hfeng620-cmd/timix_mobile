-- ============================================================
-- Timix — Share 板块补丁（补齐 run-all-migrations.sql 缺失项）
-- 复制到 Supabase SQL Editor → Run
-- ============================================================

-- ═══════════════════════════════════════════
-- PART A: shared_folders 补字段 + 补策略
-- ═══════════════════════════════════════════

-- A1. 添加 creator_id（建表时漏了）
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'shared_folders' and column_name = 'creator_id'
  ) then
    alter table public.shared_folders add column creator_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- A2. shared_folders UPDATE（创建者或管理员）
drop policy if exists "Creator or admin updates folders" on public.shared_folders;
create policy "Creator or admin updates folders"
  on public.shared_folders for update
  using (auth.uid() = creator_id or public.is_forum_admin());

-- A3. shared_folders DELETE（创建者或管理员 | 板块为空）
drop policy if exists "Creator or admin deletes folders" on public.shared_folders;
create policy "Creator or admin deletes folders"
  on public.shared_folders for delete
  using (auth.uid() = creator_id or public.is_forum_admin());

-- A4. 替换 shared_posts UPDATE 为升级版（添加 admin 鉴权）
drop policy if exists "Author updates own posts" on public.shared_posts;
drop policy if exists "Author or admin updates posts" on public.shared_posts;
create policy "Author or admin updates posts"
  on public.shared_posts for update
  using (auth.uid() = author_id or public.is_forum_admin());

-- ═══════════════════════════════════════════
-- PART B: 编辑日志表
-- ═══════════════════════════════════════════

create table if not exists public.edit_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('folder', 'post')),
  target_id uuid not null,
  editor_id uuid not null references auth.users(id) on delete cascade,
  action_summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_edit_logs_target
  on public.edit_logs(target_type, target_id, created_at desc);

alter table public.edit_logs enable row level security;

drop policy if exists "Edit logs are public" on public.edit_logs;
create policy "Edit logs are public" on public.edit_logs for select using (true);

drop policy if exists "System inserts edit logs" on public.edit_logs;
create policy "System inserts edit logs" on public.edit_logs for insert with check (true);

-- ═══════════════════════════════════════════
-- PART C: RPC 函数
-- ═══════════════════════════════════════════

-- C1. 获取编辑日志（含累计贡献次数）
create or replace function public.get_edit_logs(p_target_id uuid, p_target_type text)
returns table (
  id uuid,
  action_summary text,
  created_at timestamptz,
  editor_id uuid,
  editor_name text,
  editor_avatar text,
  total_contributions bigint
)
language sql security definer set search_path = public as $$
  select
    e.id,
    e.action_summary,
    e.created_at,
    e.editor_id,
    pf.display_name as editor_name,
    pf.avatar_url as editor_avatar,
    count(*) over (partition by e.editor_id, e.target_id) as total_contributions
  from public.edit_logs e
  left join public.forum_profiles pf on pf.id = e.editor_id
  where e.target_id = p_target_id and e.target_type = p_target_type
  order by e.created_at desc;
$$;

-- C2. 获取板块创建者
create or replace function public.get_folder_creator(p_folder_id uuid)
returns table (user_id uuid, display_name text, avatar_url text)
language sql security definer set search_path = public as $$
  select p.id as user_id, p.display_name, p.avatar_url
  from public.shared_folders f
  join public.forum_profiles p on p.id = f.creator_id
  where f.id = p_folder_id;
$$;

-- C3. 获取板块贡献者（在此板块下发表过帖子的所有用户，去重）
create or replace function public.get_folder_contributors(p_folder_id uuid)
returns table (user_id uuid, display_name text, avatar_url text)
language sql security definer set search_path = public as $$
  select distinct p.id as user_id, p.display_name, p.avatar_url
  from public.shared_posts sp
  join public.forum_profiles p on p.id = sp.author_id
  where sp.folder_id = p_folder_id
  order by p.display_name;
$$;
