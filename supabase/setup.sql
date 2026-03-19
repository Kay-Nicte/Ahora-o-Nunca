-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  is_premium boolean default false,
  premium_since timestamptz,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  category text check (category in ('home', 'work', 'mobile', 'errands', 'personal')),
  position integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Task energy levels (many-to-many)
create table if not exists task_energy_levels (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  energy_level text check (energy_level in ('high', 'calm', 'short_time', 'mobile_only')) not null
);

-- Notifications config
create table if not exists notifications_config (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  fixed_enabled boolean default true,
  fixed_time_morning text default '10:00',
  fixed_time_evening text default '18:00',
  smart_enabled boolean default false
);

-- RLS policies
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table task_energy_levels enable row level security;
alter table notifications_config enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can read own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);

create policy "Users can read own task energy" on task_energy_levels for select
  using (task_id in (select id from tasks where user_id = auth.uid()));
create policy "Users can insert own task energy" on task_energy_levels for insert
  with check (task_id in (select id from tasks where user_id = auth.uid()));
create policy "Users can delete own task energy" on task_energy_levels for delete
  using (task_id in (select id from tasks where user_id = auth.uid()));

create policy "Users can read own notif config" on notifications_config for select using (auth.uid() = user_id);
create policy "Users can upsert own notif config" on notifications_config for insert with check (auth.uid() = user_id);
create policy "Users can update own notif config" on notifications_config for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
