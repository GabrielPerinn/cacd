create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

revoke all on table public.user_plans from anon;
grant select, insert, update on table public.user_plans to authenticated;

drop policy if exists "Users can read their own plan" on public.user_plans;
create policy "Users can read their own plan"
  on public.user_plans
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own plan" on public.user_plans;
create policy "Users can create their own plan"
  on public.user_plans
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own plan" on public.user_plans;
create policy "Users can update their own plan"
  on public.user_plans
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_user_plans_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_plans_updated_at on public.user_plans;
create trigger user_plans_updated_at
  before update on public.user_plans
  for each row execute function public.set_user_plans_updated_at();
