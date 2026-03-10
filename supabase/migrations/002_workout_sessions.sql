-- Historial de entrenamientos completados
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id text not null,
  completed_at timestamptz not null default now(),
  logs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_workout_sessions_user_date 
  on public.workout_sessions (user_id, completed_at desc);

alter table public.workout_sessions enable row level security;

create policy "Users can read own sessions"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);
