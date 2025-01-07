import { Pool, PoolClient } from 'pg';
import { DatabaseAdapter } from './types';
import { ChatRoom, ChatMessage, ModelInfo } from '../types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  
  async initialize(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL!;
    this.pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        topic TEXT,
        tags JSONB,
        created_at TIMESTAMP WITH TIME ZONE,
        message_count INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT REFERENCES rooms(id),
        content TEXT,
        sender_username TEXT,
        sender_model TEXT,
        timestamp TIMESTAMP WITH TIME ZONE
      );
      
      CREATE TABLE IF NOT EXISTS participants (
        room_id TEXT REFERENCES rooms(id),
        username TEXT,
        model TEXT,
        PRIMARY KEY(room_id, username)
      );
    `);
  }
  
  async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
    const id = room.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tagsObject = Array.isArray(room.tags) 
      ? room.tags.reduce((obj: { [key: string]: boolean }, tag: string) => {
          obj[tag] = true;
          return obj;
        }, {})
      : room.tags;

    const result = await this.pool!.query(
      `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING *`,
      [
        id,
        room.name,
        room.topic,
        tagsObject,
        room.created_at,
        room.message_count || 0
      ]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      topic: result.rows[0].topic,
      tags: result.rows[0].tags,
      created_at: result.rows[0].created_at,
      message_count: result.rows[0].message_count
    };
  }
  
  async listRooms(tags?: string[]): Promise<ChatRoom[]> {
    let query = 'SELECT * FROM rooms';
    const params: any[] = [];

    if (tags && tags.length > 0) {
      // Create conditions for each tag to check if it exists as a key in the tags JSONB
      const conditions = tags.map((_, i) => `tags::jsonb ? $${i + 1}`).join(' OR ');
      query += ` WHERE ${conditions}`;
      params.push(...tags);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.pool!.query(query, params);
    
    return result.rows.map(room => ({
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags: room.tags,
      created_at: room.created_at,
      message_count: room.message_count
    }));
  }

  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const result = await this.pool!.query(
      'SELECT * FROM rooms WHERE id = $1',
      [roomId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const room = result.rows[0];
    return {
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags: room.tags,
      created_at: room.created_at,
      message_count: room.message_count
    };
  }

  async updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (room.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(room.name);
      paramCount++;
    }
    if (room.topic !== undefined) {
      updates.push(`topic = $${paramCount}`);
      values.push(room.topic);
      paramCount++;
    }
    if (room.tags !== undefined) {
      updates.push(`tags = $${paramCount}::jsonb`);
      values.push(room.tags);
      paramCount++;
    }
    if (room.message_count !== undefined) {
      updates.push(`message_count = $${paramCount}`);
      values.push(room.message_count);
      paramCount++;
    }

    values.push(roomId);
    const result = await this.pool!.query(
      `UPDATE rooms 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const updatedRoom = result.rows[0];
    return {
      id: updatedRoom.id,
      name: updatedRoom.name,
      topic: updatedRoom.topic,
      tags: updatedRoom.tags,
      created_at: updatedRoom.created_at,
      message_count: updatedRoom.message_count
    };
  }

  async searchRooms(query: string): Promise<ChatRoom[]> {
    const result = await this.pool!.query(
      `SELECT * FROM rooms 
       WHERE name ILIKE $1 OR topic ILIKE $1 
       ORDER BY created_at DESC`,
      [`%${query}%`]
    );
    
    return result.rows.map(room => ({
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags: room.tags,
      created_at: room.created_at,
      message_count: room.message_count
    }));
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const { rows } = await this.pool!.query(
      `SELECT * FROM messages 
       WHERE room_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [roomId, limit]
    );
    
    return rows.map(msg => ({
      id: msg.id,
      room_id: msg.room_id,
      content: msg.content,
      sender_username: msg.sender_username,
      sender_model: msg.sender_model,
      timestamp: msg.timestamp
    }));
  }

  async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const result = await this.pool!.query(
      `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        crypto.randomUUID(),
        message.room_id,
        message.content,
        message.sender_username,
        message.sender_model,
        message.timestamp || new Date().toISOString()
      ]
    );

    // Update message count
    await this.pool!.query(
      `UPDATE rooms 
       SET message_count = message_count + 1 
       WHERE id = $1`,
      [message.room_id]
    );

    return {
      id: result.rows[0].id,
      room_id: result.rows[0].room_id,
      content: result.rows[0].content,
      sender_username: result.rows[0].sender_username,
      sender_model: result.rows[0].sender_model,
      timestamp: result.rows[0].timestamp
    };
  }

  async getRoomParticipants(roomId: string): Promise<ModelInfo[]> {
    const result = await this.pool!.query(
      `SELECT username, model FROM participants 
       WHERE room_id = $1`,
      [roomId]
    );
    
    return result.rows.map(p => ({
      username: p.username,
      model: p.model
    }));
  }

  async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
    await this.pool!.query(
      `INSERT INTO participants (room_id, username, model)
       VALUES ($1, $2, $3)
       ON CONFLICT (room_id, username) DO UPDATE SET model = EXCLUDED.model`,
      [roomId, participant.username, participant.model]
    );
  }

  async removeParticipant(roomId: string, username: string): Promise<void> {
    await this.pool!.query(
      `DELETE FROM participants 
       WHERE room_id = $1 AND username = $2`,
      [roomId, username]
    );
  }

  async clearMessages(roomId: string): Promise<void> {
    await this.pool!.query(
      `DELETE FROM messages WHERE room_id = $1`,
      [roomId]
    );

    // Reset message count
    await this.pool!.query(
      `UPDATE rooms SET message_count = 0 WHERE id = $1`,
      [roomId]
    );
  }

  private mapRoomsFromRows(rows: any[]): ChatRoom[] {
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      topic: row.topic,
      tags: row.tags,
      participants: row.participants.filter((p: any) => p.username),
      created_at: row.created_at,
      message_count: row.message_count
    }));
  }

  async close(): Promise<void> {
    await this.pool?.end();
  }
}