create table if not exists users (
  id integer generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id integer generated always as identity primary key,
  user_id integer not null references users(id) on delete cascade,
  body text not null default '',
  image bytea,
  image_type text,
  created_at timestamptz not null default now(),
  check (body <> '' or image is not null)
);

create index if not exists posts_user_idx on posts (user_id, id desc);

create table if not exists likes (
  post_id integer not null references posts(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists comments (
  id integer generated always as identity primary key,
  post_id integer not null references posts(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments (post_id, id);

create table if not exists follows (
  follower_id integer not null references users(id) on delete cascade,
  followee_id integer not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on follows (followee_id);

create table if not exists messages (
  id integer generated always as identity primary key,
  sender_id integer not null references users(id) on delete cascade,
  recipient_id integer not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_pair_idx
  on messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), id desc);
create index if not exists messages_sender_idx on messages (sender_id);
create index if not exists messages_recipient_idx on messages (recipient_id);
