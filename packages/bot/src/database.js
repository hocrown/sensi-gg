// src/database.js — better-sqlite3 CRUD for setups table
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

/** @type {import('better-sqlite3').Database} */
let db;

/**
 * Initialize the SQLite database.
 * - Reads DATABASE_PATH from env (default: data/setup.db relative to project root)
 * - Auto-creates the directory if it doesn't exist
 * - Enables WAL mode
 * - Creates the setups table and index if they don't exist
 */
export function initDB() {
  const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(PROJECT_ROOT, 'data', 'setup.db');

  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS setups (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      userId    TEXT NOT NULL UNIQUE,
      threadId  TEXT NOT NULL,
      sens      TEXT,
      gear      TEXT,
      game      TEXT,
      tips      TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_userId ON setups(userId);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      userId   TEXT NOT NULL,
      setupId  INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(userId, setupId),
      FOREIGN KEY (setupId) REFERENCES setups(id)
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_likes_setupId ON likes(setupId);`);

  console.log(`[database] Initialized at ${dbPath}`);
}

/**
 * Insert a new setup record.
 * @param {string} userId - Discord user ID
 * @param {string} threadId - Forum thread ID
 * @param {{ sens?: string, gear?: string, game?: string, tips?: string }} data
 * @returns {{ success: true } | { success: false, error: 'duplicate' }}
 */
export function insertSetup(userId, threadId, data = {}) {
  const stmt = db.prepare(
    `INSERT INTO setups (userId, threadId, sens, gear, game, tips)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  try {
    stmt.run(
      userId,
      threadId,
      data.sens ?? null,
      data.gear ?? null,
      data.game ?? null,
      data.tips ?? null,
    );
    return { success: true };
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'duplicate' };
    }
    throw err;
  }
}

/**
 * Retrieve a setup by Discord user ID.
 * @param {string} userId
 * @returns {object | undefined}
 */
export function getSetupByUserId(userId) {
  const stmt = db.prepare(`SELECT * FROM setups WHERE userId = ?`);
  return stmt.get(userId);
}

/**
 * Partially update a setup record for the given user.
 * Uses COALESCE so that only provided (non-undefined) fields are overwritten.
 * @param {string} userId
 * @param {{ sens?: string, gear?: string, game?: string, tips?: string }} data
 * @returns {{ success: true, changes: number }}
 */
export function updateSetup(userId, data = {}) {
  const stmt = db.prepare(
    `UPDATE setups
     SET sens      = COALESCE(?, sens),
         gear      = COALESCE(?, gear),
         game      = COALESCE(?, game),
         tips      = COALESCE(?, tips),
         updatedAt = datetime('now')
     WHERE userId = ?`
  );

  const info = stmt.run(
    data.sens ?? null,
    data.gear ?? null,
    data.game ?? null,
    data.tips ?? null,
    userId,
  );

  return { success: true, changes: info.changes };
}

/**
 * Search setups with optional filters and pagination.
 * @param {{ userId?: string, tag?: 'sens' | 'gear' | 'game' | 'tips' }} filters
 * @param {number} page - 1-based page number
 * @param {number} pageSize - rows per page (default 5)
 * @returns {{ results: object[], total: number, page: number, totalPages: number }}
 */
export function searchSetups(filters = {}, page = 1, pageSize = 5) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push(`userId = ?`);
    params.push(filters.userId);
  }

  if (filters.tag) {
    // Validate the tag value to prevent SQL injection
    const validTags = ['sens', 'gear', 'game', 'tips'];
    if (validTags.includes(filters.tag)) {
      conditions.push(`${filters.tag} IS NOT NULL`);
    }
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // Count total matching rows
  const countStmt = db.prepare(`SELECT COUNT(*) AS total FROM setups ${whereClause}`);
  const { total } = countStmt.get(...params);

  // Fetch paginated results
  const offset = (page - 1) * pageSize;
  const selectStmt = db.prepare(
    `SELECT * FROM setups ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`
  );
  const results = selectStmt.all(...params, pageSize, offset);

  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Toggle a like for a setup. If already liked, remove it; otherwise add it.
 * @param {string} userId - Discord user ID (the person liking)
 * @param {number} setupId - The setup ID being liked
 * @returns {{ liked: boolean, totalLikes: number }}
 */
export function toggleLike(userId, setupId) {
  const existing = db.prepare('SELECT id FROM likes WHERE userId = ? AND setupId = ?').get(userId, setupId);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO likes (userId, setupId) VALUES (?, ?)').run(userId, setupId);
  }

  const { count } = db.prepare('SELECT COUNT(*) as count FROM likes WHERE setupId = ?').get(setupId);
  return { liked: !existing, totalLikes: count };
}

/**
 * Get the like count for a setup.
 * @param {number} setupId
 * @returns {number}
 */
export function getLikeCount(setupId) {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM likes WHERE setupId = ?').get(setupId);
  return count;
}

/**
 * Check if a user has liked a setup.
 * @param {string} userId
 * @param {number} setupId
 * @returns {boolean}
 */
export function hasUserLiked(userId, setupId) {
  const row = db.prepare('SELECT id FROM likes WHERE userId = ? AND setupId = ?').get(userId, setupId);
  return !!row;
}

/**
 * Delete a setup and its associated likes.
 * @param {string} userId - Discord user ID
 * @returns {{ success: boolean, threadId?: string }}
 */
export function deleteSetup(userId) {
  const row = db.prepare('SELECT id, threadId FROM setups WHERE userId = ?').get(userId);
  if (!row) return { success: false };

  db.prepare('DELETE FROM likes WHERE setupId = ?').run(row.id);
  db.prepare('DELETE FROM setups WHERE id = ?').run(row.id);
  return { success: true, threadId: row.threadId };
}

/**
 * Get setup ID by userId (for like button routing).
 * @param {string} setupUserId - The user who owns the setup
 * @returns {number|undefined}
 */
export function getSetupIdByUserId(setupUserId) {
  const row = db.prepare('SELECT id FROM setups WHERE userId = ?').get(setupUserId);
  return row?.id;
}
