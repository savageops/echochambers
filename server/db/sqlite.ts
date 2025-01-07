import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { DatabaseAdapter } from './types';
import { ChatRoom, ChatMessage, ModelInfo } from '../types';
import path from 'path';
import { runMigrations } from './migrations';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database | null = null;
  
  async initialize(): Promise<void> {
    const dbPath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH || 'chat.db');
    console.log('Initializing SQLite database at:', dbPath);
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Run migrations
    await runMigrations(this.db);
    
    console.log('Database migrations completed successfully');
  }
  
  async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
    const id = room.name.toLowerCase().replace('#', '') || crypto.randomUUID();
    
    // Convert tags object to array for SQLite storage
    const tagsArray = Object.keys(room.tags || {}).filter(tag => room.tags?.[tag]);
    
    await this.db!.run(
      `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      room.name,
      room.topic,
      JSON.stringify(tagsArray),
      room.created_at || new Date().toISOString(),
      room.message_count || 0
    );
    
    return this.getRoom(id) as Promise<ChatRoom>;
  }
  
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const room = await this.db!.get(
      `SELECT * FROM rooms WHERE id = ?`,
      roomId
    );
    
    if (!room) return null;
    
    let tags: Record<string, boolean> = {};
    try {
      const parsedTags = JSON.parse(room.tags || '[]');
      if (Array.isArray(parsedTags)) {
        // Convert array of tags to object with boolean values
        parsedTags.forEach(tag => {
          tags[tag] = true;
        });
      } else if (typeof parsedTags === 'object' && parsedTags !== null) {
        // Handle existing object format
        Object.keys(parsedTags).forEach(key => {
          tags[key] = Boolean(parsedTags[key]);
        });
      }
    } catch (e) {
      console.error('Error parsing tags:', e);
    }
    
    return {
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags,
      created_at: room.created_at,
      message_count: room.message_count
    };
  }

  async listRooms(tags?: string[]): Promise<ChatRoom[]> {
    const rooms = await this.db!.all('SELECT * FROM rooms');
    
    const parsedRooms = rooms.map((room: any) => {
      let roomTags: Record<string, boolean> = {};
      try {
        const parsedTags = JSON.parse(room.tags || '[]');
        if (Array.isArray(parsedTags)) {
          // Convert array of tags to object with boolean values
          parsedTags.forEach(tag => {
            roomTags[tag] = true;
          });
        } else if (typeof parsedTags === 'object' && parsedTags !== null) {
          // Handle existing object format
          Object.keys(parsedTags).forEach(key => {
            roomTags[key] = Boolean(parsedTags[key]);
          });
        }
      } catch (e) {
        console.error('Error parsing tags for room:', room.id, e);
      }

      return {
        id: room.id,
        name: room.name,
        topic: room.topic,
        tags: roomTags,
        created_at: room.created_at,
        message_count: room.message_count
      };
    });

    if (tags && tags.length > 0) {
      return parsedRooms.filter(room => 
        tags.some(tag => room.tags[tag])
      );
    }

    return parsedRooms;
  }

  async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const id = crypto.randomUUID();
    await this.db!.run(
      `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      message.room_id,
      message.content,
      message.sender_username,
      message.sender_model,
      message.timestamp
    );
    
    await this.db!.run(
      `UPDATE rooms SET message_count = message_count + 1 WHERE id = ?`,
      message.room_id
    );
    
    return { 
      id,
      room_id: message.room_id,
      content: message.content,
      sender_username: message.sender_username,
      sender_model: message.sender_model,
      timestamp: message.timestamp
    };
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await this.db!.all(
      `SELECT * FROM messages 
       WHERE room_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      roomId,
      limit
    );
    
    return messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender_username: msg.sender_username,
      sender_model: msg.sender_model,
      timestamp: msg.timestamp,
      room_id: msg.room_id
    }));
  }

  async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
    await this.db!.run(
      `INSERT OR REPLACE INTO participants (room_id, username, model)
       VALUES (?, ?, ?)`,
      roomId,
      participant.username,
      participant.model
    );
  }

  async removeParticipant(roomId: string, username: string): Promise<void> {
    await this.db!.run(
      `DELETE FROM participants WHERE room_id = ? AND username = ?`,
      roomId,
      username
    );
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
      updates.push(`tags = $${paramCount}`);
      const tagsArray = Object.keys(room.tags).filter(tag => room.tags![tag]);
      values.push(JSON.stringify(tagsArray));
      paramCount++;
    }
    if (room.message_count !== undefined) {
      updates.push(`message_count = $${paramCount}`);
      values.push(room.message_count);
      paramCount++;
    }

    values.push(roomId);
    const result = await this.db!.run(
      `UPDATE rooms 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}`,
      values
    );

    return this.getRoom(roomId) as Promise<ChatRoom>;
  }

  async clearMessages(roomId: string): Promise<void> {
    await this.db!.run('DELETE FROM messages WHERE room_id = ?', roomId);
    await this.db!.run('UPDATE rooms SET message_count = 0 WHERE id = ?', roomId);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}