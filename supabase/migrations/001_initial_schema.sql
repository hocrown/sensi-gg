-- SENSI.GG Supabase Schema
-- Phase 0: Initial migration from SQLite

-- 프로필 (Discord OAuth 연동)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id   TEXT NOT NULL UNIQUE,
  username     TEXT NOT NULL,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_discord_id ON profiles(discord_id);

-- 세팅 (멀티서버 지원)
CREATE TABLE setups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guild_id     TEXT NOT NULL,
  thread_id    TEXT,
  sens         TEXT,
  gear         TEXT,
  game         TEXT,
  tips         TEXT,
  source       TEXT NOT NULL DEFAULT 'bot',
  sync_status  TEXT NOT NULL DEFAULT 'synced',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

CREATE INDEX idx_setups_user_id ON setups(user_id);
CREATE INDEX idx_setups_guild_id ON setups(guild_id);
CREATE INDEX idx_setups_sync_status ON setups(sync_status);

-- 좋아요
CREATE TABLE likes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  setup_id     UUID NOT NULL REFERENCES setups(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, setup_id)
);

CREATE INDEX idx_likes_setup_id ON likes(setup_id);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE setups;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER setups_updated_at
  BEFORE UPDATE ON setups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
