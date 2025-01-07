import { Database } from 'sqlite';

export async function up(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      topic TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      created_at TEXT,
      message_count INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT,
      content TEXT,
      sender_username TEXT,
      sender_model TEXT,
      timestamp TEXT,
      FOREIGN KEY(room_id) REFERENCES rooms(id)
    );
    
    CREATE TABLE IF NOT EXISTS participants (
      room_id TEXT,
      username TEXT,
      model TEXT,
      PRIMARY KEY(room_id, username),
      FOREIGN KEY(room_id) REFERENCES rooms(id)
    );

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);
    CREATE INDEX IF NOT EXISTS idx_rooms_tags ON rooms USING gin (tags) WITH (fastupdate = on);
    CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);

    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);
}

export async function down(db: Database) {
  await db.exec(`
    DROP TABLE IF EXISTS participants;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS rooms;
  `);
}