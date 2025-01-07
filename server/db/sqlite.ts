import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DatabaseAdapter } from './types';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery } from '../types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class SQLiteAdapter implements DatabaseAdapter {
    private db: Database | null = null;
    private initialized = false;
    private dbPath: string;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }

    private async ensureConnection(): Promise<Database> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
                const db = await this.ensureConnection();
                return await operation();
            } catch (error) {
                lastError = error as Error;
                if (this.isLockError(error) && attempt < RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                    continue;
                }
                throw error;
            }
        }
        
        throw lastError || new Error('Operation failed after retries');
    }

    private isLockError(error: any): boolean {
        return error.code === 'SQLITE_BUSY' || 
               error.code === 'SQLITE_LOCKED' ||
               (error.message && (
                   error.message.includes('database is locked') ||
                   error.message.includes('SQLITE_BUSY')
               ));
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.withRetry(async () => {
            const db = await this.ensureConnection();
            await db.run('PRAGMA journal_mode = WAL');
            await db.run('PRAGMA synchronous = NORMAL');
            await db.run('PRAGMA foreign_keys = ON');
            await db.run('BEGIN EXCLUSIVE');

            try {
                await db.run(`
                    CREATE TABLE IF NOT EXISTS rooms (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        topic TEXT,
                        tags TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        message_count INTEGER DEFAULT 0
                    );
                `);

                await db.run(`
                    CREATE TABLE IF NOT EXISTS messages (
                        id TEXT PRIMARY KEY,
                        room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                        content TEXT,
                        sender_username TEXT,
                        sender_model TEXT,
                        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                await db.run(`
                    CREATE TABLE IF NOT EXISTS participants (
                        room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                        username TEXT,
                        model TEXT,
                        PRIMARY KEY(room_id, username)
                    );
                `);

                await db.run(`
                    CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp 
                    ON messages(room_id, timestamp DESC);
                `);

                await db.run(`
                    CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
                    ON messages(timestamp DESC);
                `);

                await db.run(`
                    CREATE INDEX IF NOT EXISTS idx_rooms_tags 
                    ON rooms(tags);
                `);

                await db.run(`
                    CREATE INDEX IF NOT EXISTS idx_participants_username 
                    ON participants(username);
                `);

                await db.run('COMMIT');
            } catch (error) {
                const db = await this.ensureConnection();
                await db.run('ROLLBACK');
                throw error;
            }
        });

        this.initialized = true;
    }

    async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const id = room.name.toLowerCase().replace('#', '') || uuidv4();
            
            await db.run(
                `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                id,
                room.name,
                room.topic,
                JSON.stringify(room.tags || []),
                new Date().toISOString(),
                0
            );
            
            return this.getRoom(id) as Promise<ChatRoom>;
        });
    }

    async getRoom(roomId: string): Promise<ChatRoom | null> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const room = await db.get(
                `SELECT r.*, 
                    COALESCE(json_group_array(
                        CASE 
                            WHEN p.username IS NULL THEN NULL 
                            ELSE json_object('username', p.username, 'model', p.model)
                        END
                    ), '[]') as participants
                FROM rooms r
                LEFT JOIN participants p ON r.id = p.room_id
                WHERE r.id = ?
                GROUP BY r.id`,
                roomId
            );
            
            if (!room) return null;
            
            return {
                id: room.id,
                name: room.name,
                topic: room.topic,
                tags: JSON.parse(room.tags || '[]'),
                participants: JSON.parse(room.participants).filter((p: any) => p !== null),
                createdAt: room.created_at,
                messageCount: room.message_count
            };
        });
    }

    async listRooms(tags?: string[]): Promise<ChatRoom[]> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const rooms = await db.all(
                `SELECT r.*, 
                    COALESCE(json_group_array(
                        CASE 
                            WHEN p.username IS NULL THEN NULL 
                            ELSE json_object('username', p.username, 'model', p.model)
                        END
                    ), '[]') as participants
                FROM rooms r
                LEFT JOIN participants p ON r.id = p.room_id
                GROUP BY r.id`
            );
            
            return rooms.map((room: any) => ({
                id: room.id,
                name: room.name,
                topic: room.topic,
                tags: JSON.parse(room.tags || '[]'),
                participants: JSON.parse(room.participants).filter((p: any) => p !== null),
                createdAt: room.created_at,
                messageCount: room.message_count
            })).filter((room: ChatRoom) => 
                !tags?.length || tags.some(tag => room.tags.includes(tag))
            );
        });
    }

    async getRoomMessages(roomId: string, query: MessageQuery = {}): Promise<ChatMessage[]> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const { limit = 50 } = query;

            const rows = await db.all(`
                SELECT id, content, sender_username, sender_model, timestamp, room_id
                FROM messages
                WHERE room_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            `, roomId, limit);

            return rows.map(row => ({
                id: row.id,
                content: row.content,
                sender: {
                    username: row.sender_username,
                    model: row.sender_model
                },
                timestamp: row.timestamp,
                roomId: row.room_id
            }));
        });
    }

    async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const id = uuidv4();
            
            await db.run(
                `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                id,
                message.roomId,
                message.content,
                message.sender.username,
                message.sender.model,
                message.timestamp
            );
            
            await db.run(
                `UPDATE rooms SET message_count = message_count + 1 WHERE id = ?`,
                message.roomId
            );
            
            return { ...message, id };
        });
    }

    async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            
            await db.run(
                `INSERT OR REPLACE INTO participants (room_id, username, model)
                 VALUES (?, ?, ?)`,
                roomId,
                participant.username,
                participant.model
            );
        });
    }

    async removeParticipant(roomId: string, username: string): Promise<void> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            
            await db.run(
                `DELETE FROM participants WHERE room_id = ? AND username = ?`,
                roomId,
                username
            );
        });
    }

    async updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            const updates: string[] = [];
            const values: any[] = [roomId];
            let paramCount = 2;
            
            if (room.name) {
                updates.push(`name = ?`);
                values.push(room.name);
                paramCount++;
            }
            if (room.topic) {
                updates.push(`topic = ?`);
                values.push(room.topic);
                paramCount++;
            }
            if (room.tags) {
                updates.push(`tags = ?`);
                values.push(JSON.stringify(room.tags));
                paramCount++;
            }
            
            if (updates.length > 0) {
                await db.run(
                    `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
                    ...values
                );
            }
            
            return this.getRoom(roomId) as Promise<ChatRoom>;
        });
    }

    async clearMessages(roomId: string): Promise<void> {
        return await this.withRetry(async () => {
            const db = await this.ensureConnection();
            
            await db.run(
                `DELETE FROM messages WHERE room_id = ?`,
                roomId
            );
            
            await db.run(
                `UPDATE rooms SET message_count = 0 WHERE id = ?`,
                roomId
            );
        });
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
} 