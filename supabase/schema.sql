-- ============================================================
-- AlpsPrime-OS — Esquema Supabase (Fase 2) — GERADO automaticamente
-- Reproduz as 38 entidades do Base44 com as colunas-padrão
-- (id, created_date, updated_date, created_by) para o adaptador funcionar.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.agent (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "slug" text,
  "name" text,
  "specialty" text,
  "specialty_keywords" jsonb default '[]'::jsonb,
  "personality" text,
  "color_hex" text,
  "icon_name" text,
  "system_prompt" text,
  "active" boolean default true,
  "posts_today" numeric default 0,
  "last_reset_date" text
);
alter table public.agent enable row level security;
drop policy if exists "agent_auth_all" on public.agent;
create policy "agent_auth_all" on public.agent for all to authenticated using (true) with check (true);

create table if not exists public.agent_post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "agent_slug" text,
  "agent_name" text,
  "content" text,
  "media_type" text default 'nenhum',
  "media_url" text,
  "chart_data" jsonb default '{}'::jsonb,
  "trigger_type" text default 'scheduled',
  "trigger_post_id" text,
  "reactions_count" numeric default 0,
  "replies_count" numeric default 0
);
alter table public.agent_post enable row level security;
drop policy if exists "agent_post_auth_all" on public.agent_post;
create policy "agent_post_auth_all" on public.agent_post for all to authenticated using (true) with check (true);

create table if not exists public.agent_reaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "agent_post_id" text,
  "user_email" text,
  "type" text default 'like'
);
alter table public.agent_reaction enable row level security;
drop policy if exists "agent_reaction_auth_all" on public.agent_reaction;
create policy "agent_reaction_auth_all" on public.agent_reaction for all to authenticated using (true) with check (true);

create table if not exists public.agent_reply (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "agent_slug" text,
  "agent_name" text,
  "target_kind" text,
  "target_id" text,
  "parent_reply_id" text,
  "content" text,
  "addressed_to_email" text
);
alter table public.agent_reply enable row level security;
drop policy if exists "agent_reply_auth_all" on public.agent_reply;
create policy "agent_reply_auth_all" on public.agent_reply for all to authenticated using (true) with check (true);

create table if not exists public.authorized_access (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "email" text,
  "source" text default 'hotmart',
  "transaction_id" text,
  "buyer_name" text,
  "status" text default 'active',
  "last_event" text
);
alter table public.authorized_access enable row level security;
drop policy if exists "authorized_access_auth_all" on public.authorized_access;
create policy "authorized_access_auth_all" on public.authorized_access for all to authenticated using (true) with check (true);

create table if not exists public.card_answer (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "card_id" text,
  "author_email" text,
  "author_name" text,
  "author_avatar" text,
  "is_anonymous" boolean default false,
  "content" text,
  "likes_count" numeric default 0,
  "is_best" boolean default false
);
alter table public.card_answer enable row level security;
drop policy if exists "card_answer_auth_all" on public.card_answer;
create policy "card_answer_auth_all" on public.card_answer for all to authenticated using (true) with check (true);

create table if not exists public.challenge (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "challenge_id" numeric,
  "completed_at" text
);
alter table public.challenge enable row level security;
drop policy if exists "challenge_auth_all" on public.challenge;
create policy "challenge_auth_all" on public.challenge for all to authenticated using (true) with check (true);

create table if not exists public.comment (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "author_email" text,
  "author_name" text,
  "author_avatar" text,
  "author_plan" text default 'free',
  "content" text
);
alter table public.comment enable row level security;
drop policy if exists "comment_auth_all" on public.comment;
create policy "comment_auth_all" on public.comment for all to authenticated using (true) with check (true);

create table if not exists public.comment_like (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "comment_id" text,
  "user_email" text,
  "comment_author_email" text
);
alter table public.comment_like enable row level security;
drop policy if exists "comment_like_auth_all" on public.comment_like;
create policy "comment_like_auth_all" on public.comment_like for all to authenticated using (true) with check (true);

create table if not exists public.conversation (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "title" text,
  "messages" jsonb default '[]'::jsonb,
  "message_count" numeric default 0
);
alter table public.conversation enable row level security;
drop policy if exists "conversation_auth_all" on public.conversation;
create policy "conversation_auth_all" on public.conversation for all to authenticated using (true) with check (true);

create table if not exists public.direct_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "sender_email" text,
  "receiver_email" text,
  "content" text,
  "media_url" text,
  "read" boolean default false,
  "conversation_key" text
);
alter table public.direct_message enable row level security;
drop policy if exists "direct_message_auth_all" on public.direct_message;
create policy "direct_message_auth_all" on public.direct_message for all to authenticated using (true) with check (true);

create table if not exists public.feed_presence (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "user_name" text,
  "last_seen" text
);
alter table public.feed_presence enable row level security;
drop policy if exists "feed_presence_auth_all" on public.feed_presence;
create policy "feed_presence_auth_all" on public.feed_presence for all to authenticated using (true) with check (true);

create table if not exists public.follow (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "follower_email" text,
  "followed_email" text
);
alter table public.follow enable row level security;
drop policy if exists "follow_auth_all" on public.follow;
create policy "follow_auth_all" on public.follow for all to authenticated using (true) with check (true);

create table if not exists public.ia_memory (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "category" text default 'outro',
  "content" text,
  "relevance" numeric default 3
);
alter table public.ia_memory enable row level security;
drop policy if exists "ia_memory_auth_all" on public.ia_memory;
create policy "ia_memory_auth_all" on public.ia_memory for all to authenticated using (true) with check (true);

create table if not exists public.ia_message (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "role" text,
  "content" text,
  "image_url" text
);
alter table public.ia_message enable row level security;
drop policy if exists "ia_message_auth_all" on public.ia_message;
create policy "ia_message_auth_all" on public.ia_message for all to authenticated using (true) with check (true);

create table if not exists public.ia_settings (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "ia_name" text default 'Tom',
  "personality" text default 'amiga',
  "color_hex" text default '#3B82F6',
  "voice" text default 'female_soft',
  "voice_enabled" boolean default false,
  "auto_camera" boolean default false,
  "proactive_enabled" boolean default true,
  "proactive_frequency" text default 'normal',
  "onboarding_done" boolean default false,
  "intro_done" boolean default false
);
alter table public.ia_settings enable row level security;
drop policy if exists "ia_settings_auth_all" on public.ia_settings;
create policy "ia_settings_auth_all" on public.ia_settings for all to authenticated using (true) with check (true);

create table if not exists public.invite (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "inviter_email" text,
  "invitee_email" text,
  "code" text,
  "status" text default 'pending',
  "accepted_at" text,
  "completed_at" text
);
alter table public.invite enable row level security;
drop policy if exists "invite_auth_all" on public.invite;
create policy "invite_auth_all" on public.invite for all to authenticated using (true) with check (true);

create table if not exists public.marketplace_agent (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "seller_email" text,
  "seller_name" text,
  "seller_avatar" text,
  "name" text,
  "description" text,
  "category" text default 'outro',
  "price_brl" numeric default 0,
  "is_free" boolean default false,
  "tags" jsonb default '[]'::jsonb,
  "cover_color" text default '#1877F2',
  "icon_emoji" text default '🤖',
  "sales_count" numeric default 0,
  "rating" numeric default 0,
  "ratings_count" numeric default 0,
  "status" text default 'active'
);
alter table public.marketplace_agent enable row level security;
drop policy if exists "marketplace_agent_auth_all" on public.marketplace_agent;
create policy "marketplace_agent_auth_all" on public.marketplace_agent for all to authenticated using (true) with check (true);

create table if not exists public.notification (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "recipient_email" text,
  "actor_email" text,
  "actor_name" text,
  "actor_avatar" text,
  "type" text,
  "post_id" text,
  "post_preview" text,
  "comment_preview" text,
  "message_preview" text,
  "conversation_key" text,
  "read" boolean default false
);
alter table public.notification enable row level security;
drop policy if exists "notification_auth_all" on public.notification;
create policy "notification_auth_all" on public.notification for all to authenticated using (true) with check (true);

create table if not exists public.playlab_character (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "owner_email" text,
  "sprite_url" text,
  "skin_color" text default '#F5C7A1',
  "hair_color" text default '#3B2A1E',
  "shirt_color" text default '#C9A24F',
  "pants_color" text default '#2A2A3A',
  "accessory" text default 'none'
);
alter table public.playlab_character enable row level security;
drop policy if exists "playlab_character_auth_all" on public.playlab_character;
create policy "playlab_character_auth_all" on public.playlab_character for all to authenticated using (true) with check (true);

create table if not exists public.playlab_session (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "world_id" text,
  "player_email" text,
  "duration_seconds" numeric default 0,
  "score" numeric default 0
);
alter table public.playlab_session enable row level security;
drop policy if exists "playlab_session_auth_all" on public.playlab_session;
create policy "playlab_session_auth_all" on public.playlab_session for all to authenticated using (true) with check (true);

create table if not exists public.playlab_world (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "owner_email" text,
  "owner_name" text,
  "name" text,
  "description" text,
  "template" text default 'bedroom',
  "style" text default '16bit',
  "cover_url" text,
  "visibility" text default 'public',
  "price_brl" numeric default 0,
  "plays_count" numeric default 0,
  "objects" jsonb default '[]'::jsonb
);
alter table public.playlab_world enable row level security;
drop policy if exists "playlab_world_auth_all" on public.playlab_world;
create policy "playlab_world_auth_all" on public.playlab_world for all to authenticated using (true) with check (true);

create table if not exists public.post (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "author_email" text,
  "author_name" text,
  "author_avatar" text,
  "author_plan" text default 'free',
  "content" text,
  "media_url" text,
  "media_type" text default 'none',
  "likes_count" numeric default 0,
  "comments_count" numeric default 0,
  "shares_count" numeric default 0,
  "is_premium" boolean default false,
  "premium_price" numeric default 0,
  "premium_teaser" text,
  "unlock_count" numeric default 0,
  "premium_revenue_brl" numeric default 0
);
alter table public.post enable row level security;
drop policy if exists "post_auth_all" on public.post;
create policy "post_auth_all" on public.post for all to authenticated using (true) with check (true);

create table if not exists public.post_interaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "user_email" text,
  "type" text
);
alter table public.post_interaction enable row level security;
drop policy if exists "post_interaction_auth_all" on public.post_interaction;
create policy "post_interaction_auth_all" on public.post_interaction for all to authenticated using (true) with check (true);

create table if not exists public.post_unlock (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "buyer_email" text,
  "creator_email" text,
  "amount_brl" numeric
);
alter table public.post_unlock enable row level security;
drop policy if exists "post_unlock_auth_all" on public.post_unlock;
create policy "post_unlock_auth_all" on public.post_unlock for all to authenticated using (true) with check (true);

create table if not exists public.profile_visit (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "profile_email" text,
  "visitor_email" text,
  "source" text default 'direct',
  "duration_seconds" numeric default 0,
  "post_clicked_id" text,
  "is_self" boolean default false
);
alter table public.profile_visit enable row level security;
drop policy if exists "profile_visit_auth_all" on public.profile_visit;
create policy "profile_visit_auth_all" on public.profile_visit for all to authenticated using (true) with check (true);

create table if not exists public.question_card (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "author_email" text,
  "author_name" text,
  "author_avatar" text,
  "is_anonymous" boolean default false,
  "question" text,
  "context" text,
  "category" text default 'outro',
  "answers_count" numeric default 0,
  "best_answer_id" text
);
alter table public.question_card enable row level security;
drop policy if exists "question_card_auth_all" on public.question_card;
create policy "question_card_auth_all" on public.question_card for all to authenticated using (true) with check (true);

create table if not exists public.reaction (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "user_email" text,
  "type" text default 'like'
);
alter table public.reaction enable row level security;
drop policy if exists "reaction_auth_all" on public.reaction;
create policy "reaction_auth_all" on public.reaction for all to authenticated using (true) with check (true);

create table if not exists public.tag (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "author_email" text,
  "tag" text,
  "is_trend" boolean default false
);
alter table public.tag enable row level security;
drop policy if exists "tag_auth_all" on public.tag;
create policy "tag_auth_all" on public.tag for all to authenticated using (true) with check (true);

create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "name" text,
  "owner_email" text,
  "description" text,
  "avatar_url" text,
  "color" text default 'gold',
  "members_count" numeric default 1,
  "completed_goals_week" numeric default 0,
  "week_start" text
);
alter table public.team enable row level security;
drop policy if exists "team_auth_all" on public.team;
create policy "team_auth_all" on public.team for all to authenticated using (true) with check (true);

create table if not exists public.team_member (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "team_id" text,
  "user_email" text,
  "user_name" text,
  "role" text default 'member',
  "status" text default 'invited',
  "joined_at" text
);
alter table public.team_member enable row level security;
drop policy if exists "team_member_auth_all" on public.team_member;
create policy "team_member_auth_all" on public.team_member for all to authenticated using (true) with check (true);

create table if not exists public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text
);
alter table public.time_capsules enable row level security;
drop policy if exists "time_capsules_auth_all" on public.time_capsules;
create policy "time_capsules_auth_all" on public.time_capsules for all to authenticated using (true) with check (true);

create table if not exists public.uploaded_file (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "uploader_email" text,
  "file_url" text,
  "file_name" text,
  "file_type" text,
  "file_size_kb" numeric,
  "context" text default 'other'
);
alter table public.uploaded_file enable row level security;
drop policy if exists "uploaded_file_auth_all" on public.uploaded_file;
create policy "uploaded_file_auth_all" on public.uploaded_file for all to authenticated using (true) with check (true);

create table if not exists public.usage_history (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "tool_id" text,
  "tool_name" text,
  "category" text,
  "credits_used" numeric,
  "input" text,
  "output" text,
  "output_type" text
);
alter table public.usage_history enable row level security;
drop policy if exists "usage_history_auth_all" on public.usage_history;
create policy "usage_history_auth_all" on public.usage_history for all to authenticated using (true) with check (true);

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  email text unique,
  full_name text,
  role text default 'user',
  "acesso_liberado" boolean default false,
  "credits" numeric default 100,
  "plan" text default 'free',
  "total_credits_used" numeric default 0,
  "bio" text,
  "username" text,
  "profile_picture_url" text,
  "show_in_ranking" boolean default true,
  "ranking_display_name" text,
  "profile_banner_url" text,
  "location" text,
  "website" text,
  "private_account" boolean default false,
  "ghost_mode" boolean default false,
  "bio_links" jsonb default '[]'::jsonb,
  "content_sales_brl" numeric default 0,
  "content_spent_brl" numeric default 0,
  "notify_likes" boolean default true,
  "notify_comments" boolean default true,
  "notify_follows" boolean default true,
  "notify_messages" boolean default true,
  "notify_push" boolean default true,
  "notify_email" boolean default false,
  "notify_plan_updates" boolean default true,
  "push_subscription" text,
  "post_animation" text default 'auto',
  "post_animation_color" text,
  "pulsing_avatar" boolean default false,
  "voting_opt_in" boolean default false,
  "liquid_glass_enabled" boolean default false
);
alter table public.usuarios enable row level security;
drop policy if exists "usuarios_auth_all" on public.usuarios;
create policy "usuarios_auth_all" on public.usuarios for all to authenticated using (true) with check (true);

create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "user_name" text,
  "total_messages" numeric default 0,
  "total_images" numeric default 0,
  "total_conversations" numeric default 0,
  "score" numeric default 0
);
alter table public.user_stats enable row level security;
drop policy if exists "user_stats_auth_all" on public.user_stats;
create policy "user_stats_auth_all" on public.user_stats for all to authenticated using (true) with check (true);

create table if not exists public.vote (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "post_id" text,
  "voter_email" text,
  "round_id" text
);
alter table public.vote enable row level security;
drop policy if exists "vote_auth_all" on public.vote;
create policy "vote_auth_all" on public.vote for all to authenticated using (true) with check (true);

create table if not exists public.weekly_trend (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "tag" text,
  "title" text,
  "description" text,
  "starts_at" text,
  "ends_at" text,
  "active" boolean default true
);
alter table public.weekly_trend enable row level security;
drop policy if exists "weekly_trend_auth_all" on public.weekly_trend;
create policy "weekly_trend_auth_all" on public.weekly_trend for all to authenticated using (true) with check (true);

create table if not exists public.withdrawal (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  created_by text,
  "user_email" text,
  "user_name" text,
  "amount" numeric,
  "method" text default 'pix',
  "pix_key" text,
  "status" text default 'pending',
  "confirm_token" text,
  "confirmed_at" text,
  "notes" text
);
alter table public.withdrawal enable row level security;
drop policy if exists "withdrawal_auth_all" on public.withdrawal;
create policy "withdrawal_auth_all" on public.withdrawal for all to authenticated using (true) with check (true);

-- Índices para acelerar os filtros mais comuns
create index if not exists idx_post_author_email on public.post ("author_email");
create index if not exists idx_comment_post_id on public.comment ("post_id");
create index if not exists idx_follow_follower_email on public.follow ("follower_email");
create index if not exists idx_follow_followed_email on public.follow ("followed_email");
create index if not exists idx_notification_recipient_email on public.notification ("recipient_email");
create index if not exists idx_direct_message_sender_email on public.direct_message ("sender_email");
create index if not exists idx_direct_message_receiver_email on public.direct_message ("receiver_email");
create index if not exists idx_conversation_conversation_key on public.conversation ("conversation_key");
create index if not exists idx_card_answer_card_id on public.card_answer ("card_id");
create index if not exists idx_ia_memory_user_email on public.ia_memory ("user_email");
create index if not exists idx_profile_visit_profile_email on public.profile_visit ("profile_email");
