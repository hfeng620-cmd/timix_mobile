-- ========================================
-- Timix观察站 · 站点编辑审核表
-- 在 Supabase SQL Editor 中运行
-- ========================================

-- 1. 创建待审核编辑表
create table if not exists public.station_pending_edits (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  editor_id uuid not null references auth.users(id) on delete cascade,
  editor_name text not null,
  field_name text not null,
  old_value text not null default '',
  new_value text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text not null default '',
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- 2. 索引
create index if not exists idx_station_pending_edits_status on public.station_pending_edits(status);
create index if not exists idx_station_pending_edits_station on public.station_pending_edits(station_id);
create index if not exists idx_station_pending_edits_created on public.station_pending_edits(created_at desc);

-- 3. RLS
alter table public.station_pending_edits enable row level security;

-- 任何人都可以插入（提交审核）
drop policy if exists "Anyone can submit pending edits" on public.station_pending_edits;
create policy "Anyone can submit pending edits" on public.station_pending_edits
  for insert with check (auth.uid() = editor_id);

-- 登录用户可以查看所有待审核（管理员审核用）
drop policy if exists "Authenticated can view pending edits" on public.station_pending_edits;
create policy "Authenticated can view pending edits" on public.station_pending_edits
  for select using (auth.role() = 'authenticated');

-- 管理员可以更新审核状态
drop policy if exists "Admins can review pending edits" on public.station_pending_edits;
create policy "Admins can review pending edits" on public.station_pending_edits
  for update using (public.is_forum_admin());

-- 4. 权限
grant insert on public.station_pending_edits to authenticated;
grant select on public.station_pending_edits to authenticated;
grant update on public.station_pending_edits to authenticated;
