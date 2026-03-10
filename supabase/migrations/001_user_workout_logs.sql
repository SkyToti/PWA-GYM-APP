-- Tabla para logs de entrenamiento por usuario
create table if not exists public.user_workout_logs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  logs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS: cada usuario solo accede a sus propios logs
alter table public.user_workout_logs enable row level security;

create policy "Users can read own logs"
  on public.user_workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.user_workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.user_workout_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
