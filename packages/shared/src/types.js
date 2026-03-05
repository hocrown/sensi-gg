// @sensi-gg/shared — Type definitions (JSDoc)
// Since the bot uses plain JS, we use JSDoc typedefs instead of TypeScript.

/**
 * @typedef {Object} Setup
 * @property {string} id - UUID (Supabase) or INTEGER (legacy SQLite)
 * @property {string} user_id - profiles.id UUID
 * @property {string} guild_id - Discord guild ID
 * @property {string|null} thread_id - Discord forum thread ID
 * @property {string|null} sens - 감도 세팅
 * @property {string|null} gear - 장비 정보
 * @property {string|null} game - 그래픽 설정
 * @property {string|null} tips - 꿀팁
 * @property {'bot'|'web'} source - 생성 출처
 * @property {'synced'|'pending_thread'|'pending_delete'} sync_status
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID
 * @property {string} discord_id - Discord user ID
 * @property {string} username - Discord username
 * @property {string|null} avatar_url - Discord avatar URL
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Like
 * @property {string} id - UUID
 * @property {string} user_id - profiles.id UUID
 * @property {string} setup_id - setups.id UUID
 * @property {string} created_at
 */

export {};
