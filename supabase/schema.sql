-- ============================================================
-- CINEMATIQUE — Supabase Schema
-- Run this in Supabase > SQL Editor to create required tables.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar      TEXT        NOT NULL DEFAULT '',
  cover_photo TEXT        NOT NULL DEFAULT '',
  bio         TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'active',
  watchlist   UUID[]      NOT NULL DEFAULT '{}',
  genres      TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── movies ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.movies (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT        NOT NULL,
  year         INTEGER,
  genres       TEXT[]      NOT NULL DEFAULT '{}',
  rating       NUMERIC(3,1),
  synopsis     TEXT,
  cast         TEXT[]      NOT NULL DEFAULT '{}',
  runtime      TEXT,
  language     TEXT,
  mood_tags    TEXT[]      NOT NULL DEFAULT '{}',
  poster_url   TEXT        NOT NULL DEFAULT '',
  backdrop_url TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row-Level Security (optional but recommended) ───────────
-- Disable RLS for server-side service role access (default).
-- Enable and add policies if you want frontend-direct access via anon key.
ALTER TABLE public.users  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;

-- Allow service role full access (already granted by default in Supabase)
GRANT ALL ON public.users  TO service_role;
GRANT ALL ON public.movies TO service_role;
