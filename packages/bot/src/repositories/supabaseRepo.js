// src/repositories/supabaseRepo.js — Clean data access layer for new schema
import { getSupabase } from '../supabase.js';

// ─── Profile helpers ───

/**
 * Get profile by Discord user ID.
 * @param {string} discordUserId
 * @returns {Promise<object|null>}
 */
export async function getProfileByDiscordUserId(discordUserId) {
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('discord_user_id', discordUserId)
    .single();
  return data;
}

/**
 * Get profile by handle (URL-safe identifier).
 * @param {string} handle
 * @returns {Promise<object|null>}
 */
export async function getProfileByHandle(handle) {
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();
  return data;
}

// ─── Setup helpers ───

/**
 * Get setup by Discord user ID. JOINs profiles + setups.
 * @param {string} discordUserId
 * @returns {Promise<object|null>} Combined profile + setup object
 */
export async function getSetupByDiscordUserId(discordUserId) {
  const profile = await getProfileByDiscordUserId(discordUserId);
  if (!profile) return null;

  const { data: setup } = await getSupabase()
    .from('setups')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  if (!setup) return null;

  return {
    profile,
    setup,
    // Convenience fields
    dpi: setup.dpi,
    general_sens: setup.general_sens,
    edpi: setup.dpi * Number(setup.general_sens),
    handle: profile.handle,
    display_name: profile.display_name,
  };
}

/**
 * Get setup by handle. JOINs profiles + setups.
 * @param {string} handle
 * @returns {Promise<object|null>} Combined profile + setup object
 */
export async function getSetupByHandle(handle) {
  const profile = await getProfileByHandle(handle);
  if (!profile) return null;

  const { data: setup } = await getSupabase()
    .from('setups')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  if (!setup) return null;

  return {
    profile,
    setup,
    dpi: setup.dpi,
    general_sens: setup.general_sens,
    edpi: setup.dpi * Number(setup.general_sens),
    handle: profile.handle,
    display_name: profile.display_name,
  };
}

/**
 * Upsert a setup for a Discord user.
 * @param {string} discordUserId
 * @param {object} setupData - Structured setup fields (dpi, general_sens, mouse, etc.)
 * @returns {Promise<{ success: boolean, setup?: object }>}
 */
export async function upsertSetup(discordUserId, setupData) {
  const profile = await getProfileByDiscordUserId(discordUserId);
  if (!profile) return { success: false };

  const { data, error } = await getSupabase()
    .from('setups')
    .upsert({
      profile_id: profile.id,
      ...setupData,
    }, { onConflict: 'profile_id' })
    .select()
    .single();

  if (error) throw error;
  return { success: true, setup: data };
}

// ─── Server helpers ───

/**
 * Get server by Discord guild ID.
 * @param {string} guildId
 * @returns {Promise<object|null>}
 */
export async function getServerByGuildId(guildId) {
  const { data } = await getSupabase()
    .from('servers')
    .select('*')
    .eq('guild_id', guildId)
    .single();
  return data;
}
