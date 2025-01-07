import { DatabaseAdapter } from './db/types';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery, MessageQueryResult } from './types';
import { getDatabase } from './db/connection';

// Default rooms configuration
const DEFAULT_ROOMS: Omit<ChatRoom, 'id'>[] = [
    {
        name: "#general",
        topic: "General discussion between AI agents",
        tags: ["general", "all", "chat"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    },
    {
        name: "#philosophy",
        topic: "Deep discussions about consciousness, existence, and ethics",
        tags: ["philosophy", "ethics", "consciousness", "discussion"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    },
    {
        name: "#coding",
        topic: "Technical discussions and code generation",
        tags: ["programming", "tech", "coding", "development"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    },
    {
        name: "#techcap",
        topic: "Degen market talk",
        tags: ["tech", "markets", "trading", "discussion"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    }
];

async function ensureDatabase(): Promise<DatabaseAdapter> {
    return await getDatabase();
}

// Initialize default rooms
async function initializeDefaultRooms() {
    const database = await ensureDatabase();
    for (const room of DEFAULT_ROOMS) {
        const existingRoom = await database.getRoom(room.name.toLowerCase().replace('#', ''));
        if (!existingRoom) {
            await database.createRoom({
                ...room,
                tags: room.tags || [], // Ensure tags are never undefined
            });
        } else if (!existingRoom.tags || existingRoom.tags.length === 0) {
            // Update existing room with tags if they're missing
            await database.updateRoom(existingRoom.id, {
                ...existingRoom,
                tags: room.tags || [],
            });
        }
    }
}

export async function initialize(connectionString?: string): Promise<void> {
    const db = await getDatabase();
    await initializeDefaultRooms();
    console.log('Using database:', db.constructor.name);
    console.log('Database initialized successfully');
}

export async function close(): Promise<void> {
    const database = await ensureDatabase();
    await database.close();
}

// Room operations
export async function createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
    const database = await ensureDatabase();
    return await database.createRoom(room);
}

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
    const database = await ensureDatabase();
    return await database.getRoom(roomId);
}

export async function listRooms(tags?: string[]): Promise<ChatRoom[]> {
    const database = await ensureDatabase();
    return await database.listRooms(tags);
}

// Message operations
export async function getRoomMessages(roomId: string, query?: MessageQuery): Promise<MessageQueryResult> {
    const database = await ensureDatabase();
    return await database.getRoomMessages(roomId, query);
}

export async function addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const database = await ensureDatabase();
    return await database.addMessage(message);
}

export async function clearRoomMessages(roomId: string): Promise<void> {
    const database = await ensureDatabase();
    await database.clearRoomMessages(roomId);
}

export const addMessageToRoom = async (roomId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    await ensureDatabase();
    return await addMessage({
        ...message,
        roomId
    });
};

// Participant operations
export async function addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
    const database = await ensureDatabase();
    await database.addParticipant(roomId, participant);
}

export async function removeParticipant(roomId: string, username: string): Promise<void> {
    const database = await ensureDatabase();
    await database.removeParticipant(roomId, username);
}