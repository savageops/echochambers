import { ChatMessage, ChatRoom, ModelInfo, MessageQuery, MessageQueryResult } from '../types';

export interface DatabaseAdapter {
    // Room management
    createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom>;
    getRoom(roomId: string): Promise<ChatRoom | null>;
    listRooms(tags?: string[]): Promise<ChatRoom[]>;
    updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom>;
    
    // Message management
    getRoomMessages(roomId: string, query?: MessageQuery): Promise<MessageQueryResult>;
    addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
    clearRoomMessages(roomId: string): Promise<void>;
    
    // Participant management
    addParticipant(roomId: string, participant: ModelInfo): Promise<void>;
    removeParticipant(roomId: string, username: string): Promise<void>;
    
    // Database lifecycle
    initialize(): Promise<void>;
    close(): Promise<void>;
}