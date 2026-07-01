-- ============================================================
-- Timix 观察站 · Drop 自定义问卷与暂停留档修复
-- 用途：
-- 1. campaigns 增加自定义问卷字段。
-- 2. campaign_summary 带出问卷字段，前台领取弹窗可动态渲染。
-- 3. 放开旧版 ui_rating 固定三选一限制，支持后台自定义选项。
-- 在 Supabase SQL Editor 中运行。
-- ============================================================

begin;

alter table public.campaigns
  add column if not exists custom_question text,
  add column if not exists custom_options text;

alter table public.drop_submissions
  drop constraint if exists drop_submissions_ui_rating_check;

create or replace view public.campaign_summary as
select
  c.id,
  c.title,
  c.sponsor_name,
  c.sponsor_url,
  c.description,
  c.total_codes,
  c.is_active,
  c.starts_at,
  c.ends_at,
  c.custom_question,
  c.custom_options,
  c.created_at,
  c.updated_at,
  count(pc.id) filter (where pc.is_claimed = false)::integer as remaining_codes,
  count(pc.id) filter (where pc.is_claimed = true)::integer as claimed_codes,
  count(pc.id)::integer as total_code_records
from public.campaigns c
left join public.promo_codes pc on pc.campaign_id = c.id
group by c.id;

drop function if exists public.claim_promo_code(uuid, uuid, text, text, text);
drop function if exists public.claim_promo_code(uuid, uuid, text, text, text, text);

create or replace function public.claim_promo_code(
  p_campaign_id uuid,
  p_user_id uuid,
  p_registered_account text,
  p_favorite_station text,
  p_ui_rating text,
  p_timix_feedback text
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_code_id uuid;
  v_code_text text;
  v_registered_account text := trim(coalesce(p_registered_account, ''));
  v_favorite_station text := trim(coalesce(p_favorite_station, ''));
  v_ui_rating text := trim(coalesce(p_ui_rating, ''));
  v_timix_feedback text := trim(coalesce(p_timix_feedback, ''));
begin
  if v_auth_user_id is null then
    raise exception '请先登录后再领取福利';
  end if;

  if p_user_id is distinct from v_auth_user_id then
    raise exception '登录状态不匹配，请刷新后重试';
  end if;

  if char_length(v_registered_account) < 1 or char_length(v_registered_account) > 200 then
    raise exception '请填写有效的目标平台注册账号';
  end if;

  if char_length(v_favorite_station) < 1 or char_length(v_favorite_station) > 1000 then
    raise exception '请填写您认为更好用、更稳定的中转站反馈';
  end if;

  if char_length(v_ui_rating) < 1 or char_length(v_ui_rating) > 120 then
    raise exception '请选择有效的互动问卷选项';
  end if;

  if char_length(v_timix_feedback) < 1 or char_length(v_timix_feedback) > 1000 then
    raise exception '请填写对 TiMix 的建议';
  end if;

  if not exists (
    select 1
    from public.forum_profiles fp
    where fp.id = v_auth_user_id
  ) then
    raise exception '请先完成论坛资料初始化后再领取福利';
  end if;

  if not exists (
    select 1
    from public.campaigns c
    where c.id = p_campaign_id
      and c.is_active = true
      and (c.starts_at is null or c.starts_at <= now())
      and (c.ends_at is null or c.ends_at > now())
  ) then
    raise exception '该活动不存在或已结束';
  end if;

  if exists (
    select 1
    from public.drop_submissions ds
    where ds.campaign_id = p_campaign_id
      and ds.user_id = v_auth_user_id
  ) then
    raise exception '您已经领取过该福利';
  end if;

  select pc.id, pc.code
    into v_code_id, v_code_text
  from public.promo_codes pc
  where pc.campaign_id = p_campaign_id
    and pc.is_claimed = false
  order by pc.id
  for update skip locked
  limit 1;

  if v_code_id is null then
    raise exception '手慢了，兑换码已被抢空';
  end if;

  update public.promo_codes
  set is_claimed = true,
      claimed_by_user_id = v_auth_user_id,
      claimed_at = now()
  where id = v_code_id;

  insert into public.drop_submissions (
    campaign_id,
    user_id,
    promo_code_id,
    sponsor_account,
    favorite_station,
    ui_rating,
    timix_feedback,
    rating,
    suggestion
  )
  values (
    p_campaign_id,
    v_auth_user_id,
    v_code_id,
    v_registered_account,
    v_favorite_station,
    v_ui_rating,
    v_timix_feedback,
    v_ui_rating,
    v_timix_feedback
  );

  return v_code_text;
exception
  when unique_violation then
    raise exception '您已经领取过该福利';
end;
$$;

grant select on public.campaign_summary to anon, authenticated;
grant execute on function public.claim_promo_code(uuid, uuid, text, text, text, text) to authenticated;

commit;
