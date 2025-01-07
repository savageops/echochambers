import { Pool, PoolClient, QueryConfig } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseAdapter } from './types';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery, MessageQueryResult } from '../types';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const STATEMENT_TIMEOUT = '30s';
const LOCK_TIMEOUT = '10s';

export class PostgresAdapter implements DatabaseAdapter {
    private pool: Pool;
    private isInitialized: boolean = false;
    private messageCache: Map<string, { messages: ChatMessage[], timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5000; // 5 seconds cache TTL
    private readonly BATCH_SIZE = 100;

    constructor(connectionString: string) {
        if (!connectionString) {
            throw new Error('Database connection string is required');
        }

        this.pool = new Pool({
            connectionString,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : undefined,
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: CONNECTION_TIMEOUT,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000
        });

        // Enable performance optimizations
        this.pool.on('connect', async (client) => {
            try {
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
                    SET statement_timeout = '${STATEMENT_TIMEOUT}';
                    SET lock_timeout = '${LOCK_TIMEOUT}';
                `);
            } catch (error) {
                console.error('Error configuring database connection:', error);
            }
        });

        // Error handling for the pool
        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client:', err);
            if (client) {
                client.release(true); // Force release with error
            }
            this.handlePoolError(err);
        });
    }

    private async handlePoolError(error: Error): Promise<void> {
        console.error('Database pool error:', error);
        try {
            // Try to gracefully end the pool
            await this.pool.end();
        } catch (endError) {
            console.error('Error ending pool:', endError);
        }

        // Create a new pool
        this.pool = new Pool(this.pool.options);
        console.log('Created new database pool after error');
    }

    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`Attempt ${attempt}/${RETRY_ATTEMPTS} failed:`, error);
                if (attempt < RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                }
            }
        }
        throw lastError || new Error('Operation failed after retries');
    }

    private async withClient<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
        let client: PoolClient | null = null;
        try {
            client = await this.pool.connect();
            return await operation(client);
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    private async initializeSchema(): Promise<void> {
        await this.withClient(async (client) => {
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
                if (acquired) {
                    await client.query('SELECT pg_advisory_unlock(1)');
                }
                return;
            }

            if (!acquired) {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        await client.query('SET statement_timeout = \'30s\'');
                        await client.query('SELECT pg_advisory_lock(1)');
                        break;
                    } catch (error) {
                        if (attempt === 3) throw error;
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }

            try {
                await client.query('BEGIN');

                // Create tables with optimized settings
                await client.query(`
                    CREATE TABLE IF NOT EXISTS rooms (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        topic TEXT,
                        tags JSONB DEFAULT '[]'::jsonb,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        message_count INTEGER DEFAULT 0
                    ) WITH (fillfactor = 90);

                    CREATE TABLE IF NOT EXISTS messages (
                        id TEXT PRIMARY KEY,
                        room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        sender_username TEXT NOT NULL,
                        sender_model TEXT NOT NULL,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    ) WITH (fillfactor = 90);

                    CREATE TABLE IF NOT EXISTS participants (
                        room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
                        username TEXT NOT NULL,
                        model TEXT NOT NULL,
                        PRIMARY KEY (room_id, username)
                    ) WITH (fillfactor = 90);

                    -- Optimized indexes for messages
                    CREATE INDEX IF NOT EXISTS idx_messages_room_id_timestamp 
                    ON messages(room_id, timestamp DESC)
                    INCLUDE (id, content, sender_username, sender_model)
                    WITH (fillfactor = 90);

                    -- Optimized indexes for rooms
                    CREATE INDEX IF NOT EXISTS idx_rooms_created_at 
                    ON rooms(created_at DESC)
                    INCLUDE (name, topic, tags, message_count)
                    WITH (fillfactor = 90);

                    CREATE INDEX IF NOT EXISTS idx_rooms_tags 
                    ON rooms USING gin (tags)
                    WITH (fastupdate = on);

                    -- Optimized indexes for participants
                    CREATE INDEX IF NOT EXISTS idx_participants_room_id 
                    ON participants(room_id)
                    INCLUDE (username, model)
                    WITH (fillfactor = 90);

                    -- Set table autovacuum parameters
                    ALTER TABLE messages SET (
                        autovacuum_vacuum_scale_factor = 0.05,
                        autovacuum_analyze_scale_factor = 0.02
                    );

                    ALTER TABLE rooms SET (
                        autovacuum_vacuum_scale_factor = 0.05,
                        autovacuum_analyze_scale_factor = 0.02
                    );
                `);

                await client.query('ANALYZE messages');
                await client.query('ANALYZE rooms');
                await client.query('ANALYZE participants');
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                await client.query('SELECT pg_advisory_unlock(1)');
            }
        });

        this.isInitialized = true;
        console.log('Database schema initialized');
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        await this.withRetry(async () => {
            await this.initializeSchema();
        });
    }

    async close(): Promise<void> {
        await this.pool.end();
    }

    async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
        const id = room.name.toLowerCase().replace('#', '') || crypto.randomUUID();
        await this.withClient(async (client) => {
            await client.query('BEGIN');

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
        });
        return this.getRoom(id) as Promise<ChatRoom>;
    }

    private mapRoomFromRow(row: any): ChatRoom {
        return {
            id: row.id,
            name: row.name,
            topic: row.topic,
            tags: Array.isArray(row.tags) ? row.tags : [],
            participants: Array.isArray(row.participants) ? row.participants : [],
            createdAt: row.created_at,
            messageCount: row.message_count
        };
    }

    async getRoom(roomId: string): Promise<ChatRoom | null> {
        const result = await this.withClient(async (client) => {
            return await client.query(
                `SELECT r.id,
                    r.name,
                    r.topic,
                    r.created_at,
                    r.message_count,
                    r.tags,
                    COALESCE(
                        (SELECT json_agg(json_build_object(
                            'username', p.username,
                            'model', p.model
                        ))::jsonb
                         FROM participants p
                         WHERE p.room_id = r.id
                        ),
                        '[]'::jsonb
                    ) as participants
                   FROM rooms r
                   WHERE r.id = $1`,
                [roomId]
            );
        });

        const room = result.rows[0];
        if (!room) return null;

        return this.mapRoomFromRow(room);
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
            await this.withClient(async (client) => {
                await client.query(
                    `UPDATE rooms SET ${updates.join(', ')} WHERE id = $1`,
                    values
                );
            });
        }

        return this.getRoom(roomId) as Promise<ChatRoom>;
    }

    async listRooms(tags?: string[]): Promise<ChatRoom[]> {
        let query = `
            SELECT r.id,
                   r.name,
                   r.topic,
                   r.tags,
                   r.created_at,
                   r.message_count,
                   COALESCE(
                       (SELECT json_agg(json_build_object(
                           'username', p.username,
                           'model', p.model
                       ))::jsonb
                        FROM participants p
                        WHERE p.room_id = r.id
                       ),
                       '[]'::jsonb
                   ) as participants
            FROM rooms r`;

        let result;
        if (tags?.length) {
            query += ` WHERE r.tags ?| $1`;
            result = await this.withClient(async (client) => {
                return await client.query(query, [tags]);
            });
        } else {
            query += ` ORDER BY r.created_at DESC`;
            result = await this.withClient(async (client) => {
                return await client.query(query);
            });
        }

        return result.rows.map(row => this.mapRoomFromRow(row));
    }

    async getRoomMessages(roomId: string, query?: MessageQuery): Promise<MessageQueryResult> {
        const { limit = 50, cursor, before, after } = query || {};
        const params: any[] = [roomId];
        let paramIndex = 2;

        let queryStr = `
            WITH message_window AS (
                SELECT id, room_id, content, sender_username, sender_model, timestamp,
                       row_number() OVER (ORDER BY timestamp DESC) as row_num
                FROM messages
                WHERE room_id = $1`;

        if (before) {
            queryStr += ` AND timestamp < $${paramIndex}`;
            params.push(before);
            paramIndex++;
        }

        if (after) {
            queryStr += ` AND timestamp > $${paramIndex}`;
            params.push(after);
            paramIndex++;
        }

        if (cursor) {
            queryStr += ` AND id > $${paramIndex}`;
            params.push(cursor);
            paramIndex++;
        }

        queryStr += `)
            SELECT id, room_id, content, sender_username, sender_model, timestamp
            FROM message_window
            WHERE row_num <= $${paramIndex}
            ORDER BY timestamp DESC`;

        params.push(limit);

        const result = await this.withClient(async (client) => {
            return await client.query({
                text: queryStr,
                values: params,
                name: 'get_room_messages'
            });
        });

        const messages: ChatMessage[] = result.rows.map(row => ({
            id: row.id,
            roomId: row.room_id,
            content: row.content,
            sender: {
                username: row.sender_username,
                model: row.sender_model
            },
            timestamp: row.timestamp
        }));

        return {
            messages,
            nextCursor: messages.length > 0 ? messages[messages.length - 1].id : undefined,
            previousCursor: messages.length > 0 ? messages[0].id : undefined
        };
    }

    async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
        const id = crypto.randomUUID();
        await this.withClient(async (client) => {
            await client.query('BEGIN');

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
        });
        return { ...message, id };
    }

    async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
        await this.withClient(async (client) => {
            await client.query(
                `INSERT INTO participants (room_id, username, model)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (room_id, username) DO UPDATE SET model = $3`,
                [roomId, participant.username, participant.model]
            );
        });
    }

    async removeParticipant(roomId: string, username: string): Promise<void> {
        await this.withClient(async (client) => {
            await client.query(
                `DELETE FROM participants WHERE room_id = $1 AND username = $2`,
                [roomId, username]
            );
        });
    }

    async clearRoomMessages(roomId: string): Promise<void> {
        const queryConfig: QueryConfig = {
            text: 'DELETE FROM messages WHERE room_id = $1',
            values: [roomId],
            name: 'clear_room_messages'
        };

        await this.withClient(async (client) => {
            await client.query(queryConfig);
        });
        
        // Clear cache for this room
        const cacheKeys = Array.from(this.messageCache.keys());
        for (const key of cacheKeys) {
            if (key.startsWith(roomId)) {
                this.messageCache.delete(key);
            }
        }
    }

    private mapMessage(row: any): ChatMessage {
        return {
            id: row.id,
            content: row.content,
            sender: {
                username: row.sender_username,
                model: row.sender_model
            },
            timestamp: row.timestamp,
            roomId: row.room_id
        };
    }

    private getCacheKey(roomId: string, query: MessageQuery): string {
        return `${roomId}:${query.limit || ''}`;
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