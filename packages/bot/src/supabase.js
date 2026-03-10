// src/supabase.js — Supabase CRUD for setups (new structured schema)
import { createClient } from '@supabase/supabase-js';

/** @type {import('@supabase/supabase-js').SupabaseClient} */
let supabase;

/**
 * Initialize Supabase client.
 */
export function initDB() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('[supabase] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  supabase = createClient(url, key);
  console.log('[supabase] Initialized');
}

/**
 * Get the Supabase client instance.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabase() {
  return supabase;
}

// ─── Profile helpers ───

/**
 * Ensure a profile exists for the given Discord user. Upsert on discord_user_id.
 * @param {{ id: string, username: string, displayAvatarURL?: () => string }} discordUser
 * @returns {Promise<string>} profile UUID
 */
export async function ensureProfile(discordUser) {
  const avatarUrl = typeof discordUser.displayAvatarURL === 'function'
    ? discordUser.displayAvatarURL()
    : discordUser.avatar_url || null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      discord_user_id: discordUser.id,
      display_name: discordUser.username,
      handle: discordUser.id,
      avatar_url: avatarUrl,
    }, { onConflict: 'discord_user_id' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Get profile by Discord user ID.
 * @param {string} discordId
 * @returns {Promise<object|null>}
 */
async function getProfileByDiscordId(discordId) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('discord_user_id', discordId)
    .single();
  return data;
}

// ─── Setup CRUD ───

/**
 * Delete a setup.
 * @param {string} userId - Discord user ID
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteSetup(userId) {
  const profile = await getProfileByDiscordId(userId);
  if (!profile) return { success: false };

  const { data: row } = await supabase
    .from('setups')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!row) return { success: false };

  await supabase.from('setups').delete().eq('id', row.id);

  return { success: true };
}

/**
 * Get setup ID by Discord userId.
 * @param {string} setupUserId - The user who owns the setup
 * @returns {Promise<string|undefined>}
 */
export async function getSetupIdByUserId(setupUserId) {
  const profile = await getProfileByDiscordId(setupUserId);
  if (!profile) return undefined;

  const { data } = await supabase
    .from('setups')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  return data?.id;
}
