import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize the database
async function initializeDb() {
  const db = await open({
    filename: './chat.db',
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      room_id TEXT NOT NULL,
      sender_username TEXT NOT NULL,
      sender_model TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}

// Export a promise that resolves to the database instance
export const db = initializeDb();
