import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

let db = null;

function nowIso() {
  return new Date().toISOString();
}

export function parseTs(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T") + (String(value).includes("Z") || String(value).includes("+") ? "" : "Z"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function initDB() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("cropgard.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      language_pref TEXT NOT NULL DEFAULT 'en',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      user_id INTEGER NOT NULL,
      image_uri TEXT,
      image_key TEXT,
      image_url TEXT,
      disease TEXT NOT NULL,
      confidence REAL NOT NULL,
      unsupported INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      deleted_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      last_sync_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await ensureColumn("users", "uuid", "uuid TEXT");
  await ensureColumn("users", "updated_at", "updated_at TEXT");
  await ensureColumn("scans", "uuid", "uuid TEXT");
  await ensureColumn("scans", "image_key", "image_key TEXT");
  await ensureColumn("scans", "image_url", "image_url TEXT");
  await ensureColumn("scans", "updated_at", "updated_at TEXT");
  await ensureColumn("scans", "deleted_at", "deleted_at TEXT");

  return db;
}

async function ensureColumn(table, column, ddl) {
  const d = await initDB();
  const rows = await d.getAllAsync(`PRAGMA table_info(${table})`);
  if (!rows.some((r) => r.name === column)) {
    await d.execAsync(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

// ─── Password hashing (SHA-256 + per-user salt) ──────────────────────────────

async function generateSalt() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, salt, ...safe } = row;
  return safe;
}

export async function getUserById(id) {
  const d = await initDB();
  const row = await d.getFirstAsync("SELECT * FROM users WHERE id = ?", [id]);
  return sanitizeUser(row);
}

async function getUserByEmail(email) {
  const d = await initDB();
  const row = await d.getFirstAsync(
    "SELECT * FROM users WHERE email = ?",
    [String(email).trim().toLowerCase()],
  );
  return row;
}

// ─── Session (single signed-in user persisted in SQLite) ────────────────────

export async function setSession(userId) {
  const d = await initDB();
  await d.runAsync("DELETE FROM session");
  await d.runAsync("INSERT INTO session (id, user_id) VALUES (1, ?)", [userId]);
}

export async function getSessionUser() {
  const d = await initDB();
  const row = await d.getFirstAsync(
    `SELECT u.* FROM session s JOIN users u ON u.id = s.user_id WHERE s.id = 1`,
  );
  return sanitizeUser(row);
}

export async function clearSession() {
  const d = await initDB();
  await d.runAsync("DELETE FROM session");
}

// ─── Sync state (JWT + last sync cursor) ────────────────────────────────────

export async function getSyncState() {
  const d = await initDB();
  return d.getFirstAsync("SELECT * FROM sync_state WHERE id = 1");
}

export async function setSyncState({ userId, token, lastSyncAt = null }) {
  const d = await initDB();
  await d.runAsync("DELETE FROM sync_state");
  await d.runAsync(
    "INSERT INTO sync_state (id, user_id, token, last_sync_at) VALUES (1, ?, ?, ?)",
    [userId, token, lastSyncAt],
  );
}

export async function clearSyncState() {
  const d = await initDB();
  await d.runAsync("DELETE FROM sync_state");
}

// ─── Local user creation / upsert (mirrors server user) ─────────────────────

export async function upsertLocalUser({ serverUser, password }) {
  const d = await initDB();
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const email = String(serverUser.email).trim().toLowerCase();

  const existing = await getUserByEmail(email);
  if (existing) {
    await d.runAsync(
      `UPDATE users SET uuid = ?, first_name = ?, last_name = ?,
         language_pref = ?, password_hash = ?, salt = ?, updated_at = ?
       WHERE id = ?`,
      [
        serverUser.uuid || existing.uuid,
        serverUser.first_name,
        serverUser.last_name,
        serverUser.language_pref || existing.language_pref,
        passwordHash,
        salt,
        nowIso(),
        existing.id,
      ],
    );
    return existing.id;
  }

  const res = await d.runAsync(
    `INSERT INTO users (uuid, first_name, last_name, email, password_hash, salt, language_pref, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      serverUser.uuid,
      serverUser.first_name,
      serverUser.last_name,
      email,
      passwordHash,
      salt,
      serverUser.language_pref || "en",
      nowIso(),
      nowIso(),
    ],
  );
  return res.lastInsertRowId;
}

// ─── Auth (server-first; local fallback keeps the app usable offline) ───────

export async function registerUser({ firstName, lastName, email, password, language }) {
  const d = await initDB();
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  try {
    const res = await d.runAsync(
      `INSERT INTO users (first_name, last_name, email, password_hash, salt, language_pref, uuid, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        salt,
        language || "en",
        Crypto.randomUUID(),
        nowIso(),
        nowIso(),
      ],
    );
    await setSession(res.lastInsertRowId);
    return getUserById(res.lastInsertRowId);
  } catch (e) {
    if (e.message && e.message.includes("UNIQUE")) {
      throw new Error("EMAIL_IN_USE");
    }
    throw e;
  }
}

export async function signInUser(email, password) {
  const d = await initDB();
  const row = await d.getFirstAsync("SELECT * FROM users WHERE email = ?", [
    email.trim().toLowerCase(),
  ]);
  if (!row) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const hash = await hashPassword(password, row.salt);
  if (hash !== row.password_hash) {
    throw new Error("INVALID_CREDENTIALS");
  }
  await setSession(row.id);
  return sanitizeUser(row);
}

export async function signOutUser() {
  await clearSession();
  await clearSyncState();
}

// ─── Profile / account ───────────────────────────────────────────────────────

export async function updateUserProfile(id, { firstName, lastName, email }) {
  const d = await initDB();
  try {
    await d.runAsync(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = ? WHERE id = ?`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), nowIso(), id],
    );
  } catch (e) {
    if (e.message && e.message.includes("UNIQUE")) {
      throw new Error("EMAIL_IN_USE");
    }
    throw e;
  }
  return getUserById(id);
}

export async function changeUserPassword(id, currentPassword, newPassword) {
  const d = await initDB();
  const row = await d.getFirstAsync("SELECT * FROM users WHERE id = ?", [id]);
  if (!row) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const hash = await hashPassword(currentPassword, row.salt);
  if (hash !== row.password_hash) {
    throw new Error("WRONG_PASSWORD");
  }
  const newSalt = await generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);
  await d.runAsync(
    "UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?",
    [newHash, newSalt, nowIso(), id],
  );
}

export async function updateUserLanguage(id, language) {
  const d = await initDB();
  await d.runAsync("UPDATE users SET language_pref = ?, updated_at = ? WHERE id = ?", [
    language,
    nowIso(),
    id,
  ]);
  return getUserById(id);
}

// ─── Scan history ────────────────────────────────────────────────────────────

export async function saveScan(userId, scan) {
  const d = await initDB();
  const ts = nowIso();
  await d.runAsync(
    `INSERT INTO scans (uuid, user_id, image_uri, disease, confidence, unsupported, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scan.uuid || Crypto.randomUUID(),
      userId,
      scan.imageUri || null,
      scan.disease,
      scan.confidence,
      scan.unsupported ? 1 : 0,
      ts,
      ts,
    ],
  );
}

function mapScan(row) {
  if (!row) return null;
  return { ...row, unsupported: !!row.unsupported };
}

export async function getLastScan(userId) {
  const d = await initDB();
  const row = await d.getFirstAsync(
    "SELECT * FROM scans WHERE user_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1",
    [userId],
  );
  return mapScan(row);
}

export async function getScans(userId) {
  const d = await initDB();
  const rows = await d.getAllAsync(
    "SELECT * FROM scans WHERE user_id = ? AND deleted_at IS NULL ORDER BY id DESC",
    [userId],
  );
  return rows.map(mapScan);
}

export async function getLocalScans(userId) {
  const d = await initDB();
  const rows = await d.getAllAsync(
    "SELECT * FROM scans WHERE user_id = ? ORDER BY id ASC",
    [userId],
  );
  for (const row of rows) {
    if (!row.uuid) {
      row.uuid = Crypto.randomUUID();
      await d.runAsync("UPDATE scans SET uuid = ? WHERE id = ?", [row.uuid, row.id]);
    }
  }
  return rows.map(mapScan);
}

export async function setScanImageKey(uuid, imageKey, imageUrl) {
  const d = await initDB();
  await d.runAsync("UPDATE scans SET image_key = ?, image_url = ? WHERE uuid = ?", [
    imageKey,
    imageUrl,
    uuid,
  ]);
}

export async function upsertScansFromServer(userId, scans) {
  const d = await initDB();
  for (const scan of scans) {
    if (scan.deleted) {
      await d.runAsync("DELETE FROM scans WHERE uuid = ? AND user_id = ?", [
        scan.uuid,
        userId,
      ]);
      continue;
    }
    const existing = await d.getFirstAsync("SELECT * FROM scans WHERE uuid = ?", [
      scan.uuid,
    ]);
    if (!existing) {
      await d.runAsync(
        `INSERT INTO scans (uuid, user_id, image_key, image_url, disease, confidence, unsupported, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scan.uuid,
          userId,
          scan.image_key || null,
          scan.image_url || null,
          scan.disease,
          scan.confidence,
          scan.unsupported ? 1 : 0,
          scan.created_at,
          scan.updated_at,
        ],
      );
    } else if (parseTs(scan.updated_at) >= parseTs(existing.updated_at)) {
      await d.runAsync(
        `UPDATE scans SET image_key = ?, image_url = ?, disease = ?, confidence = ?,
           unsupported = ?, created_at = ?, updated_at = ?, deleted_at = NULL
         WHERE uuid = ?`,
        [
          scan.image_key || null,
          scan.image_url || null,
          scan.disease,
          scan.confidence,
          scan.unsupported ? 1 : 0,
          scan.created_at,
          scan.updated_at,
          scan.uuid,
        ],
      );
    }
  }
}

export async function clearAllLocalData() {
  const d = await initDB();
  await d.runAsync("DELETE FROM scans");
  await d.runAsync("DELETE FROM session");
  await d.runAsync("DELETE FROM sync_state");
}
