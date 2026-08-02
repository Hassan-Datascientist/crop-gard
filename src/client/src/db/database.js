import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

let db = null;

export async function initDB() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("cropgard.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      language_pref TEXT NOT NULL DEFAULT 'en',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_uri TEXT,
      disease TEXT NOT NULL,
      confidence REAL NOT NULL,
      unsupported INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  return db;
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

async function getUserById(id) {
  const d = await initDB();
  const row = await d.getFirstAsync("SELECT * FROM users WHERE id = ?", [id]);
  return sanitizeUser(row);
}

// ─── Session (single signed-in user persisted in SQLite) ────────────────────

async function setSession(userId) {
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

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
  language,
}) {
  const d = await initDB();
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  try {
    const res = await d.runAsync(
      `INSERT INTO users (first_name, last_name, email, password_hash, salt, language_pref)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        salt,
        language || "en",
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
}

// ─── Profile / account ───────────────────────────────────────────────────────

export async function updateUserProfile(id, { firstName, lastName, email }) {
  const d = await initDB();
  try {
    await d.runAsync(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?`,
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), id],
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
    "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
    [newHash, newSalt, id],
  );
}

export async function updateUserLanguage(id, language) {
  const d = await initDB();
  await d.runAsync("UPDATE users SET language_pref = ? WHERE id = ?", [
    language,
    id,
  ]);
  return getUserById(id);
}

// ─── Scan history ────────────────────────────────────────────────────────────

export async function saveScan(userId, scan) {
  const d = await initDB();
  await d.runAsync(
    `INSERT INTO scans (user_id, image_uri, disease, confidence, unsupported)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      scan.imageUri || null,
      scan.disease,
      scan.confidence,
      scan.unsupported ? 1 : 0,
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
    "SELECT * FROM scans WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId],
  );
  return mapScan(row);
}

export async function getScans(userId) {
  const d = await initDB();
  const rows = await d.getAllAsync(
    "SELECT * FROM scans WHERE user_id = ? ORDER BY id DESC",
    [userId],
  );
  return rows.map(mapScan);
}
