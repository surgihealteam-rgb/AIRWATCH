-- Run in Supabase SQL Editor. Create a private Storage bucket named trailer-cuts separately.
create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alert_email text not null,
  status text not null default 'setup',
  created_at timestamptz not null default now()
);
create table if not exists public.cuts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  content_type text,
  size_bytes bigint,
  status text not null default 'uploaded_not_analyzed',
  created_at timestamptz not null default now()
);
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  label text not null default 'Live channel',
  url text not null,
  status text not null default 'pending_authorization_check',
  created_at timestamptz not null default now()
);
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  status text not null default 'candidate',
  confidence numeric,
  detected_at timestamptz not null default now(),
  evidence text
);
-- This first MVP uses a server-only service-role key. Do not expose that key in browser code.
-- Before production, add user authentication, per-user ownership policies, rate limiting, and audit logs.
