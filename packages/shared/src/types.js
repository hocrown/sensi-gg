// @sensi-gg/shared — Type definitions (JSDoc)
// Migration 002 schema — profiles, setups, servers, server_claims, server_memberships

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID
 * @property {string} discord_id - Discord user ID
 * @property {string} handle - unique handle (lowercase)
 * @property {string} display_name - display name
 * @property {string|null} avatar_url - Discord avatar URL
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Setup
 * @property {string} id - UUID
 * @property {string} profile_id - profiles.id UUID
 * @property {number} dpi
 * @property {number} general_sens
 * @property {number|null} vertical_multiplier
 * @property {number|null} ads_sens
 * @property {number|null} scope_2x
 * @property {number|null} scope_3x
 * @property {number|null} scope_4x
 * @property {number|null} scope_6x
 * @property {number|null} scope_8x
 * @property {number|null} scope_15x
 * @property {string|null} mouse
 * @property {string|null} keyboard
 * @property {string|null} headset
 * @property {string|null} mousepad
 * @property {string|null} monitor
 * @property {string|null} monitor_settings
 * @property {string|null} notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Server
 * @property {string} id - UUID
 * @property {string} slug - unique URL slug
 * @property {string} name - server display name
 * @property {string|null} guild_id - Discord guild ID
 * @property {string|null} icon_url
 * @property {string|null} owner_discord_id
 * @property {number|null} member_count
 * @property {boolean} is_public
 * @property {string|null} join_code
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ServerClaim
 * @property {string} id - UUID
 * @property {string} server_id - servers.id
 * @property {string} profile_id - profiles.id (claimer)
 * @property {'owner'|'admin'} role
 * @property {string} created_at
 */

/**
 * @typedef {Object} ServerMembership
 * @property {string} id - UUID
 * @property {string} server_id - servers.id
 * @property {string} profile_id - profiles.id
 * @property {string} created_at
 */

/** @typedef {{ name: string; count: number }} GearItem */

/**
 * @typedef {Object} ServerStats
 * @property {{ slug: string; name: string; memberCount: number; lastUpdateAt: string|null }} server
 * @property {Array<{ dpi: number; count: number; ratio: number }>} dpiDistribution
 * @property {{ bands: { low: number; mid: number; high: number }; byDpi: Array<{ dpi: number; total: number; low: number; mid: number; high: number }> }} sensitivityBands
 * @property {{ dpi: number; p25: number; p50: number; p75: number }} edpiQuantilesTopDpi
 * @property {{ mouse: GearItem[]; keyboard: GearItem[]; headset: GearItem[] }} gearTop
 */

export {};
