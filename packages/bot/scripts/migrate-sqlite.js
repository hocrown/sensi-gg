// scripts/migrate-sqlite.js — One-time migration from SQLite to Supabase
import 'dotenv/config';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function migrate() {
  // --- Open SQLite ---
  const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(PROJECT_ROOT, 'data', 'setup.db');

  if (!fs.existsSync(dbPath)) {
    console.log('[migrate] No SQLite database found at', dbPath);
    console.log('[migrate] Nothing to migrate.');
    return;
  }

  const sqlite = new Database(dbPath, { readonly: true });
  console.log('[migrate] Opened SQLite at', dbPath);

  // --- Connect Supabase ---
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  console.log('[migrate] Connected to Supabase');

  const guildId = process.env.GUILD_ID;
  if (!guildId) {
    console.error('[migrate] GUILD_ID is required');
    process.exit(1);
  }

  // --- Migrate setups ---
  const setups = sqlite.prepare('SELECT * FROM setups').all();
  console.log(`[migrate] Found ${setups.length} setups to migrate`);

  let successCount = 0;
  let skipCount = 0;

  for (const setup of setups) {
    try {
      // Upsert profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          discord_id: setup.userId,
          username: setup.userId, // Will be updated when user interacts with bot
        }, { onConflict: 'discord_id' })
        .select('id')
        .single();

      if (profileError) {
        console.error(`[migrate] Profile upsert failed for ${setup.userId}:`, profileError);
        continue;
      }

      // Insert setup
      const { error: setupError } = await supabase
        .from('setups')
        .upsert({
          user_id: profile.id,
          guild_id: guildId,
          thread_id: setup.threadId,
          sens: setup.sens,
          gear: setup.gear,
          game: setup.game,
          tips: setup.tips,
          source: 'bot',
          sync_status: 'synced',
        }, { onConflict: 'guild_id,user_id' });

      if (setupError) {
        if (setupError.code === '23505') {
          skipCount++;
          console.log(`  ⏭ Skipped (already exists): ${setup.userId}`);
        } else {
          console.error(`  ✗ Setup insert failed for ${setup.userId}:`, setupError);
        }
        continue;
      }

      successCount++;
      console.log(`  ✓ Migrated: ${setup.userId}`);
    } catch (err) {
      console.error(`  ✗ Error migrating ${setup.userId}:`, err);
    }
  }

  // --- Migrate likes ---
  const likes = sqlite.prepare('SELECT * FROM likes').all();
  console.log(`\n[migrate] Found ${likes.length} likes to migrate`);

  let likeSuccess = 0;

  for (const like of likes) {
    try {
      // Get the setup's userId to find the profile
      const setupRow = sqlite.prepare('SELECT userId FROM setups WHERE id = ?').get(like.setupId);
      if (!setupRow) continue;

      // Find liker profile
      const { data: likerProfile } = await supabase
        .from('profiles')
        .upsert({ discord_id: like.userId, username: like.userId }, { onConflict: 'discord_id' })
        .select('id')
        .single();

      // Find setup owner profile
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('discord_id', setupRow.userId)
        .single();

      if (!likerProfile || !ownerProfile) continue;

      // Find the setup in Supabase
      const { data: supaSetup } = await supabase
        .from('setups')
        .select('id')
        .eq('user_id', ownerProfile.id)
        .eq('guild_id', guildId)
        .single();

      if (!supaSetup) continue;

      await supabase
        .from('likes')
        .upsert({
          user_id: likerProfile.id,
          setup_id: supaSetup.id,
        }, { onConflict: 'user_id,setup_id' });

      likeSuccess++;
    } catch {
      // Skip individual like failures
    }
  }

  console.log(`\n[migrate] Complete!`);
  console.log(`  Setups: ${successCount} migrated, ${skipCount} skipped`);
  console.log(`  Likes: ${likeSuccess} migrated`);

  sqlite.close();
}

migrate().catch(err => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
