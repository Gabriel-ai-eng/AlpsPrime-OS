create extension if not exists pgcrypto;
create table if not exists public.agent (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  slug text,
  name text,
  specialty text,
  specialty_keywords jsonb default '[]'::jsonb,
  personality text,
  color_hex text,
  icon_name text,
  system_prompt text,
  active boolean default true,
  posts_today numeric default 0,
  last_reset_date text
);
create table if not exists public.agent_post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  agent_slug text,
  agent_name text,
  content text,
  media_type text default 'nenhum',
  media_url text,
  chart_data jsonb default '{}'::jsonb,
  trigger_type text default 'scheduled',
  trigger_post_id text,
  reactions_count numeric default 0,
  replies_count numeric default 0
);
create table if not exists public.agent_reaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  agent_post_id text,
  user_email text,
  type text default 'like'
);
create table if not exists public.agent_reply (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  agent_slug text,
  agent_name text,
  target_kind text,
  target_id text,
  parent_reply_id text,
  content text,
  addressed_to_email text
);
create table if not exists public.authorized_access (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  email text,
  source text default 'hotmart',
  transaction_id text,
  buyer_name text,
  status text default 'active',
  last_event text
);
create table if not exists public.card_answer (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  card_id text,
  author_email text,
  author_name text,
  author_avatar text,
  is_anonymous boolean default false,
  content text,
  likes_count numeric default 0,
  is_best boolean default false
);
create table if not exists public.challenge (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  challenge_id numeric,
  completed_at text
);
create table if not exists public.comment (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  post_id text,
  author_email text,
  author_name text,
  author_avatar text,
  author_plan text default 'free',
  content text
);
create table if not exists public.comment_like (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  comment_id text,
  user_email text,
  comment_author_email text
);
create table if not exists public.conversation (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  title text,
  messages jsonb default '[]'::jsonb,
  message_count numeric default 0
);
create table if not exists public.direct_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  sender_email text,
  receiver_email text,
  content text,
  media_url text,
  read boolean default false,
  conversation_key text
);
create table if not exists public.feed_presence (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  user_name text,
  last_seen text
);
create table if not exists public.follow (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  follower_email text,
  followed_email text
);
create table if not exists public.ia_memory (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  category text default 'outro',
  content text,
  relevance numeric default 3
);
create table if not exists public.ia_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  role text,
  content text,
  image_url text
);
create table if not exists public.ia_settings (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  ia_name text default 'Tom',
  personality text default 'amiga',
  color_hex text default '#3B82F6',
  voice text default 'female_soft',
  voice_enabled boolean default false,
  auto_camera boolean default false,
  proactive_enabled boolean default true,
  proactive_frequency text default 'normal',
  onboarding_done boolean default false,
  intro_done boolean default false
);
create table if not exists public.invite (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  inviter_email text,
  invitee_email text,
  code text,
  status text default 'pending',
  accepted_at text,
  completed_at text
);
create table if not exists public.marketplace_agent (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  seller_email text,
  seller_name text,
  seller_avatar text,
  name text,
  description text,
  category text default 'outro',
  price_brl numeric default 0,
  is_free boolean default false,
  tags jsonb default '[]'::jsonb,
  cover_color text default '#1877F2',
  icon_emoji text default '🤖',
  sales_count numeric default 0,
  rating numeric default 0,
  ratings_count numeric default 0,
  status text default 'active'
);
create table if not exists public.notification (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  recipient_email text,
  actor_email text,
  actor_name text,
  actor_avatar text,
  type text,
  post_id text,
  post_preview text,
  comment_preview text,
  message_preview text,
  conversation_key text,
  read boolean default false
);
create table if not exists public.playlab_character (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  owner_email text,
  sprite_url text,
  skin_color text default '#F5C7A1',
  hair_color text default '#3B2A1E',
  shirt_color text default '#C9A24F',
  pants_color text default '#2A2A3A',
  accessory text default 'none'
);
create table if not exists public.playlab_session (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  world_id text,
  player_email text,
  duration_seconds numeric default 0,
  score numeric default 0
);
create table if not exists public.playlab_world (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  owner_email text,
  owner_name text,
  name text,
  description text,
  template text default 'bedroom',
  style text default '16bit',
  cover_url text,
  visibility text default 'public',
  price_brl numeric default 0,
  plays_count numeric default 0,
  objects jsonb default '[]'::jsonb
);
create table if not exists public.post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  author_email text,
  author_name text,
  author_avatar text,
  author_plan text default 'free',
  content text,
  media_url text,
  media_type text default 'none',
  likes_count numeric default 0,
  comments_count numeric default 0,
  shares_count numeric default 0,
  is_premium boolean default false,
  premium_price numeric default 0,
  premium_teaser text,
  unlock_count numeric default 0,
  premium_revenue_brl numeric default 0
);
create table if not exists public.post_interaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  post_id text,
  user_email text,
  type text
);
create table if not exists public.profile_visit (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  profile_email text,
  visitor_email text,
  source text default 'direct',
  duration_seconds numeric default 0,
  post_clicked_id text,
  is_self boolean default false
);
create table if not exists public.question_card (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  author_email text,
  author_name text,
  author_avatar text,
  is_anonymous boolean default false,
  question text,
  context text,
  category text default 'outro',
  answers_count numeric default 0,
  best_answer_id text
);
create table if not exists public.reaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  post_id text,
  user_email text,
  type text default 'like'
);
create table if not exists public.tag (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  post_id text,
  author_email text,
  tag text,
  is_trend boolean default false
);
create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  name text,
  owner_email text,
  description text,
  avatar_url text,
  color text default 'gold',
  members_count numeric default 1,
  completed_goals_week numeric default 0,
  week_start text
);
create table if not exists public.team_member (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  team_id text,
  user_email text,
  user_name text,
  role text default 'member',
  status text default 'invited',
  joined_at text
);
create table if not exists public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text
);
create table if not exists public.uploaded_file (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  uploader_email text,
  file_url text,
  file_name text,
  file_type text,
  file_size_kb numeric,
  context text default 'other'
);
create table if not exists public.usage_history (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  tool_id text,
  tool_name text,
  category text,
  credits_used numeric,
  input text,
  output text,
  output_type text
);
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  email text unique,
  full_name text,
  role text default 'user',
  acesso_liberado boolean default false,
  credits numeric default 100,
  plan text default 'free',
  total_credits_used numeric default 0,
  bio text,
  username text,
  profile_picture_url text,
  show_in_ranking boolean default true,
  ranking_display_name text,
  profile_banner_url text,
  location text,
  website text,
  private_account boolean default false,
  ghost_mode boolean default false,
  bio_links jsonb default '[]'::jsonb,
  content_sales_brl numeric default 0,
  content_spent_brl numeric default 0,
  notify_likes boolean default true,
  notify_comments boolean default true,
  notify_follows boolean default true,
  notify_messages boolean default true,
  notify_push boolean default true,
  notify_email boolean default false,
  notify_plan_updates boolean default true,
  push_subscription text,
  post_animation text default 'auto',
  post_animation_color text,
  pulsing_avatar boolean default false,
  voting_opt_in boolean default false,
  liquid_glass_enabled boolean default false
);
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  user_email text,
  user_name text,
  total_messages numeric default 0,
  total_images numeric default 0,
  total_conversations numeric default 0,
  score numeric default 0
);
create index if not exists idx_post_author_email on public.post (author_email);
create index if not exists idx_comment_post_id on public.comment (post_id);
create index if not exists idx_follow_follower_email on public.follow (follower_email);
create index if not exists idx_follow_followed_email on public.follow (followed_email);
create index if not exists idx_notification_recipient_email on public.notification (recipient_email);
create index if not exists idx_direct_message_sender_email on public.direct_message (sender_email);
create index if not exists idx_direct_message_receiver_email on public.direct_message (receiver_email);
create index if not exists idx_conversation_conversation_key on public.conversation (conversation_key);
create index if not exists idx_card_answer_card_id on public.card_answer (card_id);
create index if not exists idx_ia_memory_user_email on public.ia_memory (user_email);
create index if not exists idx_profile_visit_profile_email on public.profile_visit (profile_email);
