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
 * Insert a new setup record.
 * @param {string} userId - Discord user ID
 * @param {string} threadId - Forum thread ID (unused in new schema, kept for API compat)
 * @param {{ sens?: string, gear?: string, game?: string, tips?: string }} data
 * @returns {Promise<{ success: true } | { success: false, error: 'duplicate' }>}
 */
export async function insertSetup(userId, threadId, data = {}) {
  const profileId = await ensureProfile({ id: userId, username: userId });

  const { error } = await supabase
    .from('setups')
    .insert({
      profile_id: profileId,
      sens: data.sens || null,
      gear: data.gear || null,
      game: data.game || null,
      tips: data.tips || null,
    });

  if (error) {
    if (error.code === '23505') { // unique_violation
      return { success: false, error: 'duplicate' };
    }
    throw error;
  }
  return { success: true };
}

/**
 * Retrieve a setup by Discord user ID.
 * @param {string} userId - Discord user ID
 * @returns {Promise<object|undefined>}
 */
export async function getSetupByUserId(userId) {
  const profile = await getProfileByDiscordId(userId);
  if (!profile) return undefined;

  const { data } = await supabase
    .from('setups')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  if (!data) return undefined;

  // Map to legacy format for backward compatibility
  return {
    ...data,
    userId,
  };
}

/**
 * Partially update a setup record for the given user.
 * @param {string} userId - Discord user ID
 * @param {{ sens?: string, gear?: string, game?: string, tips?: string }} data
 * @returns {Promise<{ success: true, changes: number }>}
 */
export async function updateSetup(userId, data = {}) {
  const profile = await getProfileByDiscordId(userId);
  if (!profile) return { success: true, changes: 0 };

  const updates = { updated_at: new Date().toISOString() };
  if (data.sens !== undefined) updates.sens = data.sens;
  if (data.gear !== undefined) updates.gear = data.gear;
  if (data.game !== undefined) updates.game = data.game;
  if (data.tips !== undefined) updates.tips = data.tips;

  const { data: result, error } = await supabase
    .from('setups')
    .update(updates)
    .eq('profile_id', profile.id)
    .select();

  if (error) throw error;

  return { success: true, changes: result?.length || 0 };
}

/**
 * Search setups with optional filters and pagination.
 * @param {{ userId?: string, tag?: 'sens'|'gear'|'game'|'tips' }} filters
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<{ results: object[], total: number, page: number, totalPages: number }>}
 */
export async function searchSetups(filters = {}, page = 1, pageSize = 5) {
  let query = supabase
    .from('setups')
    .select('*, profiles!inner(discord_user_id, display_name, avatar_url)', { count: 'exact' });

  if (filters.userId) {
    const profile = await getProfileByDiscordId(filters.userId);
    if (!profile) return { results: [], total: 0, page, totalPages: 0 };
    query = query.eq('profile_id', profile.id);
  }

  if (filters.tag) {
    const validTags = ['sens', 'gear', 'game', 'tips'];
    if (validTags.includes(filters.tag)) {
      query = query.not(filters.tag, 'is', null);
    }
  }

  const offset = (page - 1) * pageSize;
  query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  // Map to legacy format
  const results = (data || []).map(row => ({
    ...row,
    userId: row.profiles.discord_user_id,
  }));

  return {
    results,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

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
