create table if not exists dossiers (
  user_id text primary key,
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists people (
  id serial primary key,
  user_id text not null,
  name text not null,
  company text not null default '',
  role text not null default '',
  brief text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists people_user_idx on people (user_id, updated_at desc);

create table if not exists facts (
  id serial primary key,
  user_id text not null,
  person_id integer not null,
  claim text not null,
  source_url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists facts_person_idx on facts (user_id, person_id, created_at desc);

create table if not exists entries (
  id serial primary key,
  user_id text not null,
  person_id integer,
  kind text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_idx on entries (user_id, created_at desc);
create index if not exists entries_person_idx on entries (user_id, person_id, created_at desc);
