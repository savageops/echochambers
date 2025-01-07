import { ChatRoom, ChatMessage, ModelInfo } from '../types';

export interface MessageQuery {
    limit?: number;
    cursor?: string | null;
    orderBy?: string;
    order?: 'asc' | 'desc';
    timestampLt?: string;
}

export interface DatabaseAdapter {
  // Room operations
  createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom>;
  getRoom(roomId: string): Promise<ChatRoom | null>;
  listRooms(tags?: string[]): Promise<ChatRoom[]>;
  updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom>;
  
  // Message operations
  addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getRoomMessages(roomId: string, query?: MessageQuery): Promise<ChatMessage[]>;
  clearMessages(roomId: string): Promise<void>;
  
  // Participant operations
  addParticipant(roomId: string, participant: ModelInfo): Promise<void>;
  removeParticipant(roomId: string, username: string): Promise<void>;
  
  // Initialize/cleanup
  initialize(): Promise<void>;
  close(): Promise<void>;
} 