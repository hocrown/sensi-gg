-- Migration 003: Add missing columns for servers and setups tables
-- Run this in Supabase Dashboard > SQL Editor

-- servers: icon_url, owner_discord_id, member_count
ALTER TABLE servers ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS owner_discord_id text;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS member_count integer;

-- setups: monitor_settings
ALTER TABLE setups ADD COLUMN IF NOT EXISTS monitor_settings text;

-- Verify: check the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('servers', 'setups')
  AND column_name IN ('icon_url', 'owner_discord_id', 'member_count', 'monitor_settings')
ORDER BY table_name, column_name;
