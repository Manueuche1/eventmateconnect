
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'attendee' check (role in ('attendee', 'organizer', 'both')),
  organization_name text,
  organization_verified boolean default false,
  preferences_categories text[] default array[]::text[],
  preferences_areas text[] default array[]::text[],
  avatar_initials text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'attendee'),
    upper(substring(coalesce(new.raw_user_meta_data->>'full_name', new.email), 1, 2))
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('music', 'comedy', 'tech', 'food', 'art', 'sports', 'lifestyle', 'professional')),
  venue text not null,
  area text not null,
  event_date timestamptz not null,
  doors_open text,
  hero_image text not null,
  trending boolean default false,
  is_published boolean default true,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  created_at timestamptz default now()
);

create index events_category_idx on public.events(category);
create index events_date_idx on public.events(event_date);
create index events_organizer_idx on public.events(organizer_id);

grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;

create table public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  price_ngn integer not null default 0 check (price_ngn >= 0),
  quantity_total integer not null check (quantity_total >= 0),
  quantity_sold integer not null default 0,
  display_order integer default 0,
  created_at timestamptz default now()
);

create index tiers_event_idx on public.ticket_tiers(event_id);

grant select on public.ticket_tiers to anon;
grant select, insert, update, delete on public.ticket_tiers to authenticated;
grant all on public.ticket_tiers to service_role;

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  tier_id uuid not null references public.ticket_tiers(id),
  holder_name text not null,
  status text not null default 'active' check (status in ('active', 'used', 'refunded', 'expired')),
  scanned_at timestamptz,
  scanned_by uuid references public.profiles(id),
  purchased_at timestamptz default now()
);

create index tickets_user_idx on public.tickets(user_id);
create index tickets_event_idx on public.tickets(event_id);
create index tickets_code_idx on public.tickets(ticket_code);

grant select, insert, update, delete on public.tickets to authenticated;
grant all on public.tickets to service_role;

create or replace function public.generate_ticket_code()
returns trigger language plpgsql as $$
begin
  if new.ticket_code is null then
    new.ticket_code := 'EM-' ||
      upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4)) ||
      '-' ||
      upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
  end if;
  return new;
end; $$;

drop trigger if exists set_ticket_code on public.tickets;
create trigger set_ticket_code
  before insert on public.tickets
  for each row execute function public.generate_ticket_code();

create or replace function public.increment_tier_sold()
returns trigger language plpgsql as $$
begin
  update public.ticket_tiers set quantity_sold = quantity_sold + 1 where id = new.tier_id;
  return new;
end; $$;

drop trigger if exists on_ticket_created on public.tickets;
create trigger on_ticket_created
  after insert on public.tickets
  for each row execute function public.increment_tier_sold();

create table public.saved_events (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, event_id)
);

grant select, insert, delete on public.saved_events to authenticated;
grant all on public.saved_events to service_role;

alter table public.profiles enable row level security;
create policy "Profiles publicly readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.events enable row level security;
create policy "Published events readable" on public.events for select using (is_published = true or organizer_id = auth.uid());
create policy "Organizers create events" on public.events for insert with check (organizer_id = auth.uid());
create policy "Organizers update own events" on public.events for update using (organizer_id = auth.uid());
create policy "Organizers delete own events" on public.events for delete using (organizer_id = auth.uid());

alter table public.ticket_tiers enable row level security;
create policy "Tiers publicly readable" on public.ticket_tiers for select using (true);
create policy "Organizers manage own tiers" on public.ticket_tiers for all using (
  exists (select 1 from public.events where events.id = ticket_tiers.event_id and events.organizer_id = auth.uid())
);

alter table public.tickets enable row level security;
create policy "Users see own tickets or organizers see event tickets" on public.tickets for select using (
  user_id = auth.uid() or exists (
    select 1 from public.events where events.id = tickets.event_id and events.organizer_id = auth.uid()
  )
);
create policy "Users create own tickets" on public.tickets for insert with check (user_id = auth.uid());
create policy "Organizers update event tickets" on public.tickets for update using (
  exists (select 1 from public.events where events.id = tickets.event_id and events.organizer_id = auth.uid())
);

alter table public.saved_events enable row level security;
create policy "Users see own saves" on public.saved_events for select using (user_id = auth.uid());
create policy "Users save events" on public.saved_events for insert with check (user_id = auth.uid());
create policy "Users unsave events" on public.saved_events for delete using (user_id = auth.uid());
