-- SENSI.GG Migration 002: Web-first schema redesign
-- Replaces JSON-blob setups with structured columns,
-- adds servers, server_claims, server_memberships, stats view.
--
-- BREAKING CHANGE: The old setups table (sens/gear/game/tips TEXT columns,
-- guild_id, thread_id, source, sync_status) is dropped and replaced.
-- The old likes table is also dropped.
-- If you have existing data, run a manual migration script BEFORE this file.
--
-- DEPLOYMENT NOTE: Bot code (supabase.js, sync.js) references removed columns
-- (guild_id on setups, sync_status, thread_id, source, username).
-- bot-refactorer will update all bot code simultaneously.
-- DO NOT apply this migration without also deploying updated bot code.
-- web version.md decision: Forum-as-DB deprecated, web-first architecture.

-- ============================================================
-- 0. Drop old tables that conflict with new schema
-- ============================================================

-- Remove from realtime publication first (ignore error if not present)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE setups;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop old triggers (wrapped in DO block — safe if table doesn't exist)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS setups_updated_at ON setups;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop old tables (order matters for FK deps)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS setups CASCADE;

-- ============================================================
-- 1. Alter profiles table (add new columns, keep existing data)
-- ============================================================

-- Rename discord_id -> discord_user_id for clarity
ALTER TABLE profiles RENAME COLUMN discord_id TO discord_user_id;

-- Add handle column (URL-safe unique identifier)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- Add display_name column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Backfill: set handle and display_name from username for existing rows
UPDATE profiles
SET handle = COALESCE(handle, username),
    display_name = COALESCE(display_name, username)
WHERE handle IS NULL OR display_name IS NULL;

-- Now make them NOT NULL
ALTER TABLE profiles ALTER COLUMN handle SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;

-- Drop the old username column (replaced by display_name)
ALTER TABLE profiles DROP COLUMN IF EXISTS username;

-- IMPORTANT: profiles.id MUST equal auth.users.id (auth.uid()).
-- The OAuth callback MUST insert profiles with: id = auth.uid()
-- If existing profiles have gen_random_uuid() IDs, run a one-time re-link script.
-- We do NOT add FK to auth.users here because existing bot-created profiles
-- may not have auth entries yet.

-- Recreate index (old one was on discord_id, column is now renamed)
DROP INDEX IF EXISTS idx_profiles_discord_id;
CREATE INDEX IF NOT EXISTS idx_profiles_discord_user_id ON profiles(discord_user_id);

-- Reattach updated_at trigger (already exists from 001, but ensure it's there)
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. New setups table (structured columns)
-- ============================================================

CREATE TABLE IF NOT EXISTS setups (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Sensitivity
  dpi                   INTEGER NOT NULL,
  general_sens          NUMERIC(6,4) NOT NULL,
  vertical_multiplier   NUMERIC(6,4),
  ads_sens              NUMERIC(6,4),
  scope_2x              NUMERIC(6,4),
  scope_3x              NUMERIC(6,4),
  scope_4x              NUMERIC(6,4),
  scope_6x              NUMERIC(6,4),
  scope_8x              NUMERIC(6,4),
  scope_15x             NUMERIC(6,4),

  -- Gear
  mouse                 TEXT,
  keyboard              TEXT,
  headset               TEXT,
  mousepad              TEXT,
  monitor               TEXT,

  -- Misc
  notes                 TEXT,

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),

  UNIQUE(profile_id)  -- one setup per user
);

CREATE INDEX IF NOT EXISTS idx_setups_profile_id ON setups(profile_id);
CREATE INDEX IF NOT EXISTS idx_setups_dpi ON setups(dpi);
CREATE INDEX IF NOT EXISTS idx_setups_updated_at ON setups(updated_at DESC);

-- updated_at trigger
CREATE TRIGGER setups_updated_at
  BEFORE UPDATE ON setups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Re-add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE setups;

-- ============================================================
-- 3. Servers table
-- ============================================================

CREATE TABLE IF NOT EXISTS servers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  is_public     BOOLEAN DEFAULT true,
  join_code     TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- guild_id: nullable — allows bot to look up server by Discord guildId,
-- but servers without a bot (web-only) can exist with guild_id = NULL.
ALTER TABLE servers ADD COLUMN IF NOT EXISTS guild_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_servers_guild_id ON servers(guild_id);

CREATE INDEX IF NOT EXISTS idx_servers_slug ON servers(slug);
CREATE INDEX IF NOT EXISTS idx_servers_join_code ON servers(join_code);

CREATE TRIGGER servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. Server claims (ownership)
-- ============================================================

CREATE TABLE IF NOT EXISTS server_claims (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id               UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE UNIQUE,
  claimed_by_profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. Server memberships
-- ============================================================

CREATE TABLE IF NOT EXISTS server_memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id     UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_server_memberships_server_id ON server_memberships(server_id);
CREATE INDEX IF NOT EXISTS idx_server_memberships_profile_id ON server_memberships(profile_id);

-- ============================================================
-- 6. Row-Level Security
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_all ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- setups
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY setups_select_all ON setups
  FOR SELECT USING (true);

CREATE POLICY setups_insert_own ON setups
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY setups_update_own ON setups
  FOR UPDATE USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY setups_delete_own ON setups
  FOR DELETE USING (profile_id = auth.uid());

-- servers
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY servers_select_public ON servers
  FOR SELECT USING (
    is_public = true
    OR id IN (
      SELECT server_id FROM server_claims
      WHERE claimed_by_profile_id = auth.uid()
    )
    OR id IN (
      SELECT server_id FROM server_memberships
      WHERE profile_id = auth.uid()
    )
  );
-- Note: No DELETE policy for servers — deletion is admin-only (app layer).
-- Server owners can transfer/abandon via server_claims update instead.

CREATE POLICY servers_insert_authenticated ON servers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY servers_update_owner ON servers
  FOR UPDATE USING (
    id IN (
      SELECT server_id FROM server_claims
      WHERE claimed_by_profile_id = auth.uid()
    )
  );

-- server_claims
ALTER TABLE server_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY server_claims_select_all ON server_claims
  FOR SELECT USING (true);

CREATE POLICY server_claims_insert_authenticated ON server_claims
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND claimed_by_profile_id = auth.uid()
  );

-- server_memberships
ALTER TABLE server_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY server_memberships_select_all ON server_memberships
  FOR SELECT USING (true);

CREATE POLICY server_memberships_insert_authenticated ON server_memberships
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND profile_id = auth.uid()
  );

CREATE POLICY server_memberships_delete_own ON server_memberships
  FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- 7. Functions
-- ============================================================

-- Rotate join_code (only server owner can call)
CREATE OR REPLACE FUNCTION rotate_join_code(target_server_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Verify caller is the server owner
  IF NOT EXISTS (
    SELECT 1 FROM server_claims
    WHERE server_id = target_server_id
      AND claimed_by_profile_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the server owner can rotate the join code';
  END IF;

  new_code := gen_random_uuid()::text;

  UPDATE servers
  SET join_code = new_code
  WHERE id = target_server_id;

  RETURN new_code;
END;
$$;

-- ============================================================
-- 8. Stats VIEW (MVP)
-- ============================================================

CREATE OR REPLACE VIEW server_stats_raw AS
SELECT
  sm.server_id,
  p.id AS profile_id,
  s.dpi,
  s.general_sens,
  (s.dpi * s.general_sens)::NUMERIC(10,2) AS edpi,
  s.mouse,
  s.keyboard,
  s.headset
FROM server_memberships sm
JOIN profiles p ON p.id = sm.profile_id
JOIN setups s ON s.profile_id = sm.profile_id;
