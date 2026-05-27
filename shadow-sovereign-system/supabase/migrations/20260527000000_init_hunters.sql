-- Create hunters table to persist player progression
create table if not exists public.hunters (
  id uuid primary key,
  email text not null unique,
  username text not null,
  save_state jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for modern security practices
alter table public.hunters enable row level security;

-- Create policies allowing read, insert, and update operations
drop policy if exists "Allow anyone to query hunter progress" on public.hunters;
create policy "Allow anyone to query hunter progress" on public.hunters
  for select using (true);

drop policy if exists "Allow anyone to establish hunter profiles" on public.hunters;
create policy "Allow anyone to establish hunter profiles" on public.hunters
  for insert with check (true);

drop policy if exists "Allow hunters to synchronize progression" on public.hunters;
create policy "Allow hunters to synchronize progression" on public.hunters
  for update using (true);

-- Create a trigger function that automatically inserts a default state into public.hunters when a user signs up via auth
create or replace function public.handle_new_hunter()
returns trigger as $$
begin
  insert into public.hunters (id, email, username, save_state)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    jsonb_build_object(
      'username', coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
      'playerRank', 'E',
      'level', 1,
      'exp', 0,
      'nextLevelExp', 1000,
      'availableStatPoints', 5,
      'stats', jsonb_build_object(
        'strength', 10,
        'agility', 10,
        'intelligence', 10,
        'focus', 10,
        'discipline', 10,
        'creativity', 10
      ),
      'statsHistory', jsonb_build_object(
        'strength', jsonb_build_array(10),
        'agility', jsonb_build_array(10),
        'intelligence', jsonb_build_array(10),
        'focus', jsonb_build_array(10),
        'discipline', jsonb_build_array(10),
        'creativity', jsonb_build_array(10),
        'dates', jsonb_build_array(to_char(now(), 'YYYY-MM-DD'))
      ),
      'quests', jsonb_build_array(
        jsonb_build_object('id', 'quest_pushup', 'label', 'Flexões de Braço', 'current', 0, 'target', 100, 'unit', 'reps', 'rewardExp', 400, 'rewardStat', 'strength'),
        jsonb_build_object('id', 'quest_situp', 'label', 'Abdominais Diários', 'current', 0, 'target', 100, 'unit', 'reps', 'rewardExp', 400, 'rewardStat', 'discipline'),
        jsonb_build_object('id', 'quest_squat', 'label', 'Agachamentos Sombrios', 'current', 0, 'target', 100, 'unit', 'reps', 'rewardExp', 400, 'rewardStat', 'agility'),
        jsonb_build_object('id', 'quest_run', 'label', 'Corrida de Resistência', 'current', 0.0, 'target', 10, 'unit', 'km', 'rewardExp', 800, 'rewardStat', 'focus')
      ),
      'milestones', jsonb_build_array(
        jsonb_build_object('id', 'ms_double_dun', 'label', 'Sobrevivente do Templo Duplo', 'desc', 'Escapar com vida da masmorra oculta Rank D', 'unlocked', true),
        jsonb_build_object('id', 'ms_rank_c', 'label', 'Superação Neural Rank C', 'desc', 'Atingir nível 40 no portal de treinamento', 'unlocked', false),
        jsonb_build_object('id', 'ms_monarch', 'label', 'Herdeiro do Monarca das Sombras', 'desc', 'Liberar a classe de Necromancia Sombria', 'unlocked', false)
      ),
      'achievements', jsonb_build_array(
        jsonb_build_object('id', 'ach_1', 'title', 'O Despertar', 'desc', 'Concluir a primeira sessão do Portal Pomodoro', 'done', false),
        jsonb_build_object('id', 'ach_2', 'title', 'Treino de Ferro', 'desc', 'Completar todas as tarefas de treinamento diário', 'done', false),
        jsonb_build_object('id', 'ach_3', 'title', 'Supremacia Sombria', 'desc', 'Elevar qualquer estatística de combate acima de 80', 'done', false)
      ),
      'visualTheme', 'shadow',
      'animationsEnabled', true,
      'isMuted', false
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to link auth.users creation to public.hunters profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_hunter();
