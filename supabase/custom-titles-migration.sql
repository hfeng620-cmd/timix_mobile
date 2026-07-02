-- Timix 观察站 · 用户自定义头衔
-- 在 Supabase SQL Editor 中运行。
-- 项目真实用户资料表为 public.forum_profiles，不是 profiles。

alter table public.forum_profiles
  add column if not exists custom_title text not null default '';

comment on column public.forum_profiles.custom_title is '站主/管理员分配给用户的自定义紫色头衔';

create or replace function public.set_user_custom_title(
  p_user_id uuid,
  p_custom_title text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if auth.uid() is null or not public.is_forum_admin(auth.uid()) then
    raise exception 'permission denied: only admins can set custom titles';
  end if;

  v_title := left(trim(coalesce(p_custom_title, '')), 40);

  update public.forum_profiles
  set custom_title = v_title,
      updated_at = now()
  where id = p_user_id;
end;
$$;

grant execute on function public.set_user_custom_title(uuid, text) to authenticated;
