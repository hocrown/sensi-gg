// src/sync.js — Supabase Realtime listener for web → bot synchronization
// NOTE: The new schema (002) removed sync_status, thread_id, and source columns.
// Forum-as-DB is deprecated. This listener now watches for INSERT/UPDATE on setups
// and logs changes for monitoring purposes only.
import { getSupabase } from './supabase.js';

/**
 * Start Supabase Realtime listener for setups table changes.
 * @param {import('discord.js').Client} client
 */
export function startRealtimeListener(client) {
  const supabase = getSupabase();

  supabase
    .channel('setups-sync')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'setups',
    }, async (payload) => {
      try {
        console.log(`[sync] Setup ${payload.eventType}: ${payload.new?.id || payload.old?.id}`);
      } catch (err) {
        console.error('[sync] Realtime handler error:', err);
      }
    })
    .subscribe((status) => {
      console.log(`[sync] Realtime subscription: ${status}`);
    });
}

/**
 * Recover pending sync operations (called on bot startup).
 * No-op in new schema (sync_status column removed).
 * @param {import('discord.js').Client} client
 */
export async function recoverPending(client) {
  console.log('[sync] No pending operations to recover (new schema)');
}
