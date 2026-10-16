-- FADE — Postgres schema for Supabase. Mirrors src/lib/types.ts.
-- Untested against a live project: the app currently runs on the in-browser store.

create extension if not exists pgcrypto;

-- ───────── people ─────────
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  name text not null,
  headline text not null default '',
  bio text not null default '',
  city text not null default '',
  country text not null default '',
  timezone text not null default 'Asia/Kolkata',
  languages text[] not null default '{English}',
  skills text[] not null default '{}',
  roles text[] not null default '{buyer}' check (roles <@ array['buyer','seller']),
  level smallint not null default 1 check (level between 1 and 3),
  verified boolean not null default false,
  availability text not null default 'open' check (availability in ('open','limited','booked')),
  created_at timestamptz not null default now()
);

-- ───────── catalogue ─────────
create table categories (
  slug text primary key,
  name text not null,
  blurb text not null,
  subcategories text[] not null default '{}'
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid not null references profiles on delete cascade,
  category text not null references categories,
  subcategory text not null,
  title text not null check (char_length(title) between 15 and 80),
  tagline text not null,
  description text not null,
  tags text[] not null default '{}',
  features text[] not null default '{}',
  what_you_get text[] not null default '{}',
  process jsonb not null default '[]',
  requirements text[] not null default '{}',
  faq jsonb not null default '[]',
  art jsonb not null,
  media text[] not null default '{}',
  status text not null default 'active' check (status in ('active','paused','draft')),
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'B') ||
    setweight(to_tsvector('english', subcategory), 'C') ||
    setweight(to_tsvector('english', tagline || ' ' || description), 'D')
  ) stored
);
create index services_search_idx on services using gin (search);
create index services_category_idx on services (category) where status = 'active';

create table packages (
  service_id uuid references services on delete cascade,
  tier smallint check (tier between 1 and 3),
  name text not null,
  price int not null check (price >= 500),          -- INR, whole rupees
  days int not null check (days >= 1),
  revisions int,                                     -- null = unlimited
  support text not null,
  deliverables text[] not null,
  feature_count smallint not null,
  primary key (service_id, tier)
);

create table portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles on delete cascade,
  title text not null,
  discipline text not null,
  year smallint not null,
  summary text not null,
  result text not null,
  tags text[] not null default '{}',
  client text,
  art jsonb not null
);

-- ───────── orders ─────────
create table orders (
  id bigint generated always as identity (start with 301) primary key,
  service_id uuid not null references services,
  tier smallint not null,
  buyer_id uuid not null references profiles,
  seller_id uuid not null references profiles,
  status text not null default 'requested'
    check (status in ('requested','confirmed','in_progress','review','delivered','completed','cancelled')),
  price int not null,
  fee int not null,
  brief text not null default '',
  extras text[] not null default '{}',
  deadline timestamptz not null,
  revisions_used int not null default 0,
  revisions_total int,
  payment_status text not null default 'escrow' check (payment_status in ('pending','escrow','released','refunded')),
  payment_method text not null,
  stripe_payment_intent text unique,
  stage_times jsonb not null default '{}',
  created_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);
create index orders_buyer_idx on orders (buyer_id, created_at desc);
create index orders_seller_idx on orders (seller_id, created_at desc);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  order_id bigint not null references orders on delete cascade,
  title text not null,
  amount int not null,
  due timestamptz not null,
  done boolean not null default false
);

create table order_files (
  id uuid primary key default gen_random_uuid(),
  order_id bigint not null references orders on delete cascade,
  name text not null,
  size bigint not null,
  kind text not null,
  storage_path text not null,                        -- Supabase Storage, private bucket
  uploaded_by uuid not null references profiles,
  final boolean not null default false,
  created_at timestamptz not null default now()
);

create table order_activity (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders on delete cascade,
  actor_id uuid references profiles,
  text text not null,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id bigint unique not null references orders,
  service_id uuid not null references services,
  creator_id uuid not null references profiles,
  author_id uuid not null references profiles,
  quality smallint not null check (quality between 1 and 5),
  communication smallint not null check (communication between 1 and 5),
  delivery smallint not null check (delivery between 1 and 5),
  text text not null check (char_length(text) >= 20),
  reply text,
  created_at timestamptz not null default now()
);

-- ───────── messaging & notifications ─────────
create table conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles,
  seller_id uuid not null references profiles,
  order_id bigint references orders,
  service_id uuid references services,
  created_at timestamptz not null default now(),
  unique (buyer_id, seller_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  sender_id uuid references profiles,                -- null = system message
  kind text not null check (kind in ('text','file','image','order','payment','system')),
  text text,
  attachments jsonb not null default '[]',
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index messages_conv_idx on messages (conversation_id, created_at);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text not null,
  mode text not null check (mode in ('buyer','seller','both')),
  important boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table saved (
  user_id uuid references profiles on delete cascade,
  target_id uuid not null,
  kind text not null check (kind in ('service','creator')),
  primary key (user_id, target_id)
);

-- ───────── row-level security ─────────
alter table profiles enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table portfolio_projects enable row level security;
alter table orders enable row level security;
alter table milestones enable row level security;
alter table order_files enable row level security;
alter table order_activity enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table saved enable row level security;

-- public catalogue
create policy "profiles are public" on profiles for select using (true);
create policy "own profile" on profiles for update using (auth.uid() = id);
create policy "active services are public" on services for select using (status = 'active' or creator_id = auth.uid());
create policy "creators manage services" on services for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "packages follow service" on packages for select using (exists (select 1 from services s where s.id = service_id and (s.status = 'active' or s.creator_id = auth.uid())));
create policy "creators manage packages" on packages for all using (exists (select 1 from services s where s.id = service_id and s.creator_id = auth.uid()));
create policy "portfolio is public" on portfolio_projects for select using (true);
create policy "creators manage portfolio" on portfolio_projects for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "reviews are public" on reviews for select using (true);
create policy "buyers review completed orders" on reviews for insert with check (
  author_id = auth.uid() and exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid() and o.status = 'completed')
);
create policy "creators reply" on reviews for update using (creator_id = auth.uid());

-- order parties only. Status changes go through a server route (service role) that enforces the state machine.
create policy "parties read orders" on orders for select using (auth.uid() in (buyer_id, seller_id));
create policy "parties read milestones" on milestones for select using (exists (select 1 from orders o where o.id = order_id and auth.uid() in (o.buyer_id, o.seller_id)));
create policy "sellers tick milestones" on milestones for update using (exists (select 1 from orders o where o.id = order_id and o.seller_id = auth.uid()));
create policy "parties read files" on order_files for select using (exists (select 1 from orders o where o.id = order_id and auth.uid() in (o.buyer_id, o.seller_id)));
create policy "parties upload files" on order_files for insert with check (uploaded_by = auth.uid() and exists (select 1 from orders o where o.id = order_id and auth.uid() in (o.buyer_id, o.seller_id)));
create policy "parties read activity" on order_activity for select using (exists (select 1 from orders o where o.id = order_id and auth.uid() in (o.buyer_id, o.seller_id)));

create policy "parties read conversations" on conversations for select using (auth.uid() in (buyer_id, seller_id));
create policy "buyers start conversations" on conversations for insert with check (buyer_id = auth.uid());
create policy "parties read messages" on messages for select using (exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)));
create policy "parties send messages" on messages for insert with check (sender_id = auth.uid() and kind in ('text','file','image') and exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)));

create policy "own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark own read" on notifications for update using (user_id = auth.uid());
create policy "own saved" on saved for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- realtime for the inbox
alter publication supabase_realtime add table messages, notifications;
