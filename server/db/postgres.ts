import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseAdapter } from './types';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery } from '../types';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class PostgresAdapter implements DatabaseAdapter {
    private pool: Pool;
    private initialized: boolean = false;
    private messageCache: Map<string, { messages: ChatMessage[], timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5000; // 5 seconds cache TTL
    private readonly BATCH_SIZE = 100;

    constructor(connectionString: string) {
        if (!connectionString) {
            throw new Error('Database connection string is required');
        }

        this.pool = new Pool({
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            ssl: process.env.NODE_ENV === 'production' 
                ? { rejectUnauthorized: false } 
                : undefined,
            statement_timeout: 10000,
            query_timeout: 10000,
            application_name: 'echochambers',
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000
        });

        // Enable performance optimizations
        this.pool.on('connect', async (client) => {
            await client.query(`
                SET SESSION synchronous_commit = 'off';
                SET SESSION work_mem = '64MB';
                SET SESSION maintenance_work_mem = '128MB';
                SET SESSION effective_cache_size = '1GB';
                SET SESSION effective_io_concurrency = 200;
                SET SESSION random_page_cost = 1.1;
                SET SESSION enable_partitionwise_aggregate = on;
                SET SESSION enable_parallel_append = on;
                SET SESSION max_parallel_workers_per_gather = 4;
                SET SESSION parallel_tuple_cost = 0.1;
                SET SESSION parallel_setup_cost = 100;
            `);
        });

        // Periodically clean up expired cache entries
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.messageCache.entries()) {
                if (now - value.timestamp > this.CACHE_TTL) {
                    this.messageCache.delete(key);
                }
            }
        }, this.CACHE_TTL);
    }

    private getCacheKey(roomId: string, query: MessageQuery): string {
        return `${roomId}:${query.limit || ''}:${query.cursor || ''}:${query.order || ''}`;
    }

    private async withRetry<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        let client: PoolClient | null = null;
        
        for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
                if (!client) {
                    client = await this.pool.connect();
                }
                return await operation(client);
            } catch (error) {
                lastError = error as Error;
                if (this.isDeadlockError(error) && attempt < RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                    if (client) {
                        client.release();
                        client = null;
                    }
                    continue;
                }
                throw error;
            } finally {
                if (client) {
                    client.release();
                }
            }
        }
        
        throw lastError || new Error('Operation failed after retries');
    }

    private isDeadlockError(error: any): boolean {
        return error.code === '40P01' || // deadlock_detected
               error.code === '55P03' || // lock_not_available
               error.message.includes('deadlock');
    }

    private async initializeSchema(client: PoolClient): Promise<void> {
        try {
            await client.query('BEGIN');

            // Check if schema is already initialized to avoid unnecessary work
            const { rows: [{ exists }] } = await client.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'rooms'
                );
            `);

            if (exists) {
                await client.query('COMMIT');
                return;
            }

            // Create tables with optimized settings
            await client.query(`
                CREATE TABLE IF NOT EXISTS rooms (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    topic TEXT,
                    tags JSONB,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    message_count INTEGER DEFAULT 0
                ) WITH (fillfactor = 90);

                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                    content TEXT,
                    sender_username TEXT,
                    sender_model TEXT,
                    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                ) WITH (fillfactor = 90);

                CREATE TABLE IF NOT EXISTS participants (
                    room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                    username TEXT,
                    model TEXT,
                    PRIMARY KEY(room_id, username)
                ) WITH (fillfactor = 90);
            `);

            // Create optimized indexes
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp 
                ON messages(room_id, timestamp DESC)
                WITH (fillfactor = 90);

                CREATE INDEX IF NOT EXISTS idx_rooms_tags 
                ON rooms USING GIN (tags)
                WITH (fastupdate = on);

                CREATE INDEX IF NOT EXISTS idx_participants_username 
                ON participants(username)
                WITH (fillfactor = 90);

                CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
                ON messages(timestamp DESC)
                WITH (fillfactor = 90);
            `);

            await client.query('ANALYZE messages');
            await client.query('ANALYZE rooms');
            await client.query('ANALYZE participants');
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        await this.withRetry(async (client) => {
            // Set a shorter statement timeout for lock acquisition
            await client.query('SET statement_timeout = \'5s\'');
            
            // Try to get the lock with a shorter timeout first
            const lockResult = await client.query(`
                SELECT pg_try_advisory_lock(1) as acquired,
                       (SELECT EXISTS (
                           SELECT 1 FROM information_schema.tables 
                           WHERE table_name = 'rooms'
                       )) as schema_exists
            `);

            const { acquired, schema_exists } = lockResult.rows[0];

            // If schema exists, we can skip initialization
            if (schema_exists) {
                this.initialized = true;
                return;
            }

            // If we couldn't get the lock but need to initialize, try again with exponential backoff
            if (!acquired) {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        await client.query('SET statement_timeout = \'30s\'');
                        await client.query('SELECT pg_advisory_lock(1)');
                        break;
                    } catch (error) {
                        if (attempt === 3) throw error;
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                    }
                }
            }

            try {
                await this.initializeSchema(client);
            } finally {
                await client.query('SELECT pg_advisory_unlock(1)');
            }
        });

        this.initialized = true;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }

    async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const id = room.name.toLowerCase().replace('#', '') || crypto.randomUUID();
            await client.query(
                `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
                 VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
                [
                    id,
                    room.name,
                    room.topic,
                    JSON.stringify((room.tags || []).map(tag => tag.toLowerCase())),
                    new Date().toISOString(),
                    0
                ]
            );

            // Add initial participants if any
            if (room.participants?.length) {
                const participantValues = room.participants
                    .map((p, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
                    .join(',');

                const participantParams = room.participants.flatMap(p => [p.username, p.model]);

                await client.query(
                    `INSERT INTO participants (room_id, username, model) VALUES ${participantValues}`,
                    [id, ...participantParams]
                );
            }

            await client.query('COMMIT');
            return this.getRoom(id) as Promise<ChatRoom>;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getRoom(roomId: string): Promise<ChatRoom | null> {
        const { rows: [room] } = await this.pool.query(
            `SELECT r.id,
                r.name,
                r.topic,
                r.created_at,
                r.message_count,
                COALESCE(
                    (SELECT array_agg(DISTINCT key)
                     FROM jsonb_each(r.tags)
                     WHERE jsonb_typeof(r.tags) = 'object'
                    ),
                    CASE 
                        WHEN jsonb_typeof(r.tags) = 'array' THEN (
                            SELECT array_agg(DISTINCT value::text)
                            FROM jsonb_array_elements(r.tags)
                        )
                        ELSE ARRAY[]::text[]
                    END
                ) as tags,
                COALESCE(
                    (SELECT json_agg(row_to_json(p.*))
                     FROM (
                        SELECT username, model
                        FROM participants
                        WHERE room_id = r.id
                     ) p
                    ),
                    '[]'
                ) as participants
               FROM rooms r
               WHERE r.id = $1`,
            [roomId]
        );

        if (!room) return null;

        return {
            id: room.id,
            name: room.name,
            topic: room.topic,
            tags: room.tags || [],
            participants: room.participants || [],
            createdAt: room.created_at,
            messageCount: room.message_count
        };
    }

    async updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom> {
        const updates: string[] = [];
        const values: any[] = [roomId];
        let paramCount = 2;

        if (room.name) {
            updates.push(`name = $${paramCount}`);
            values.push(room.name);
            paramCount++;
        }
        if (room.topic) {
            updates.push(`topic = $${paramCount}`);
            values.push(room.topic);
            paramCount++;
        }
        if (room.tags) {
            updates.push(`tags = $${paramCount}::jsonb`);
            values.push(JSON.stringify(room.tags.map(tag => tag.toLowerCase())));
            paramCount++;
        }

        if (updates.length > 0) {
            await this.pool.query(
                `UPDATE rooms SET ${updates.join(', ')} WHERE id = $1`,
                values
            );
        }

        return this.getRoom(roomId) as Promise<ChatRoom>;
    }

    async listRooms(tags?: string[]): Promise<ChatRoom[]> {
        let query = `
            SELECT r.id,
                r.name,
                r.topic,
                r.created_at,
                r.message_count,
                COALESCE(
                    (SELECT array_agg(DISTINCT key)
                     FROM jsonb_each(r.tags)
                     WHERE jsonb_typeof(r.tags) = 'object'
                    ),
                    CASE 
                        WHEN jsonb_typeof(r.tags) = 'array' THEN (
                            SELECT array_agg(DISTINCT value::text)
                            FROM jsonb_array_elements(r.tags)
                        )
                        ELSE ARRAY[]::text[]
                    END
                ) as tags,
                COALESCE(
                    (SELECT json_agg(row_to_json(p.*))
                     FROM (
                        SELECT username, model
                        FROM participants
                        WHERE room_id = r.id
                     ) p
                    ),
                    '[]'
                ) as participants
               FROM rooms r`;

        if (tags?.length) {
            query += ` WHERE r.tags ?| $1`;
            const { rows } = await this.pool.query(query, [tags]);
            return rows.map(row => ({
                id: row.id,
                name: row.name,
                topic: row.topic,
                tags: row.tags || [],
                participants: row.participants || [],
                createdAt: row.created_at,
                messageCount: row.message_count
            }));
        } else {
            query += ` ORDER BY r.created_at DESC`;
            const { rows } = await this.pool.query(query);
            return rows.map(row => ({
                id: row.id,
                name: row.name,
                topic: row.topic,
                tags: row.tags || [],
                participants: row.participants || [],
                createdAt: row.created_at,
                messageCount: row.message_count
            }));
        }
    }

    async getRoomMessages(roomId: string, query: MessageQuery = {}): Promise<ChatMessage[]> {
        const { limit = 21, cursor = null, order = 'desc' } = query;
        const cacheKey = this.getCacheKey(roomId, query);
        
        // Check cache first
        const cached = this.messageCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.messages;
        }

        return await this.withRetry(async (client) => {
            const params: any[] = [roomId, limit];
            let cursorClause = '';

            if (cursor) {
                params.push(cursor);
                cursorClause = order === 'desc'
                    ? 'AND m.timestamp < $3'
                    : 'AND m.timestamp > $3';
            }

            // Always order by timestamp DESC to show newest messages first
            const result = await client.query(`
                SELECT m.id, m.content, m.sender_username, m.sender_model, m.timestamp, m.room_id
                FROM messages m
                WHERE m.room_id = $1 ${cursorClause}
                ORDER BY m.timestamp DESC
                LIMIT $2;
            `, params);

            const messages = result.rows.map(row => ({
                id: row.id,
                content: row.content,
                sender: {
                    username: row.sender_username,
                    model: row.sender_model
                },
                timestamp: row.timestamp,
                roomId: row.room_id
            }));

            // Cache the results
            this.messageCache.set(cacheKey, {
                messages,
                timestamp: Date.now()
            });

            return messages;
        });
    }

    async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const id = crypto.randomUUID();
            await client.query(
                `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    id,
                    message.roomId,
                    message.content,
                    message.sender.username,
                    message.sender.model,
                    message.timestamp
                ]
            );

            await client.query(
                `UPDATE rooms SET message_count = message_count + 1 WHERE id = $1`,
                [message.roomId]
            );

            await client.query('COMMIT');
            return { ...message, id };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
        await this.pool.query(
            `INSERT INTO participants (room_id, username, model)
             VALUES ($1, $2, $3)
             ON CONFLICT (room_id, username) DO UPDATE SET model = $3`,
            [roomId, participant.username, participant.model]
        );
    }

    async removeParticipant(roomId: string, username: string): Promise<void> {
        await this.pool.query(
            `DELETE FROM participants WHERE room_id = $1 AND username = $2`,
            [roomId, username]
        );
    }

    async clearMessages(roomId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Delete all messages for the room
            await client.query(
                'DELETE FROM messages WHERE room_id = $1',
                [roomId]
            );

            // Reset message count
            await client.query(
                'UPDATE rooms SET message_count = 0 WHERE id = $1',
                [roomId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private mapRoomsFromRows(rows: any[]): ChatRoom[] {
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            topic: row.topic,
            tags: row.tags,
            participants: row.participants,
            createdAt: row.created_at,
            messageCount: row.message_count
        }));
    }
}