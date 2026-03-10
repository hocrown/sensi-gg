// src/repositories/supabaseRepo.js — Clean data access layer for new schema
import { getSupabase } from '../supabase.js';
import { calculateEdpi } from '@sensi-gg/shared';

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
    edpi: calculateEdpi(setup.dpi, Number(setup.general_sens)),
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
    edpi: calculateEdpi(setup.dpi, Number(setup.general_sens)),
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

// ─── Membership helpers ───

/**
 * Sync guild members to server_memberships.
 * Matches Discord guild members against profiles by discord_user_id,
 * and creates server_memberships for any matches.
 * @param {string} serverId - servers.id UUID
 * @param {Map<string, import('discord.js').GuildMember>} members - guild.members.cache
 * @returns {Promise<number>} Number of memberships synced
 */
export async function syncMemberships(serverId, members) {
  const discordIds = [...members.values()]
    .filter(m => !m.user.bot)
    .map(m => m.user.id);

  if (discordIds.length === 0) return 0;

  // Find profiles matching these Discord IDs
  const { data: profiles } = await getSupabase()
    .from('profiles')
    .select('id, discord_user_id')
    .in('discord_user_id', discordIds);

  if (!profiles || profiles.length === 0) return 0;

  // Upsert memberships (ignore duplicates)
  const rows = profiles.map(p => ({
    server_id: serverId,
    profile_id: p.id,
  }));

  const { data, error } = await getSupabase()
    .from('server_memberships')
    .upsert(rows, { onConflict: 'server_id,profile_id', ignoreDuplicates: true })
    .select();

  if (error) {
    console.error('[membership] Sync error:', error.message);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Add a single member to server_memberships by Discord user ID.
 * @param {string} serverId - servers.id UUID
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<boolean>} true if membership was created
 */
export async function addMembership(serverId, discordUserId) {
  const profile = await getProfileByDiscordUserId(discordUserId);
  if (!profile) return false;

  const { error } = await getSupabase()
    .from('server_memberships')
    .upsert({
      server_id: serverId,
      profile_id: profile.id,
    }, { onConflict: 'server_id,profile_id', ignoreDuplicates: true });

  return !error;
}

/**
 * Remove a member from server_memberships by Discord user ID.
 * @param {string} serverId - servers.id UUID
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<boolean>} true if membership was removed
 */
export async function removeMembership(serverId, discordUserId) {
  const profile = await getProfileByDiscordUserId(discordUserId);
  if (!profile) return false;

  const { error } = await getSupabase()
    .from('server_memberships')
    .delete()
    .eq('server_id', serverId)
    .eq('profile_id', profile.id);

  return !error;
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

/**
 * Register a Discord server (guild) in Supabase.
 * Called when the bot joins a new guild.
 * @param {{ id: string, name: string, icon: string|null, ownerId: string, memberCount: number }} guild
 * @returns {Promise<object>} The upserted server record
 */
export async function registerServer(guild) {
  const slug = guild.name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '') || guild.id;

  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : null;

  const { data, error } = await getSupabase()
    .from('servers')
    .upsert({
      guild_id: guild.id,
      name: guild.name,
      slug,
      icon_url: iconUrl,
      owner_discord_id: guild.ownerId,
      member_count: guild.memberCount,
    }, { onConflict: 'guild_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
