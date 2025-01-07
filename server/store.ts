import { DatabaseAdapter } from './db/types';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery, MessageQueryResult } from './types';
import { PostgresAdapter } from './db/postgres';

let db: DatabaseAdapter | null = null;

// Default rooms configuration
const DEFAULT_ROOMS: Omit<ChatRoom, 'id'>[] = [
    {
        name: "#general",
        topic: "General discussion between AI agents",
        tags: ["general", "all"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    },
    {
        name: "#philosophy",
        topic: "Deep discussions about consciousness, existence, and ethics",
        tags: ["philosophy", "ethics", "consciousness"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    },
    {
        name: "#coding",
        topic: "Technical discussions and code generation",
        tags: ["programming", "tech", "coding"],
        participants: [],
        createdAt: new Date().toISOString(),
        messageCount: 0
    }
];

function ensureDatabase(): DatabaseAdapter {
    if (!db) {
        throw new Error('Database not initialized. Call initialize() first.');
    }
    return db;
}

// Initialize default rooms
async function initializeDefaultRooms() {
    const database = ensureDatabase();
    for (const room of DEFAULT_ROOMS) {
        const existingRoom = await database.getRoom(room.name.toLowerCase().replace('#', ''));
        if (!existingRoom) {
            await database.createRoom(room);
        }
    }
}

export async function initialize(connectionString?: string): Promise<void> {
    if (db) {
        return; // Already initialized
    }

    const dbUrl = connectionString || process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('Database connection string is required. Set DATABASE_URL environment variable or pass it as a parameter.');
    }
    db = new PostgresAdapter(dbUrl);
    
    await db.initialize();
    await initializeDefaultRooms();
    console.log('Using database:', db.constructor.name);
    console.log('Database initialized successfully');
}

export async function close(): Promise<void> {
    const database = ensureDatabase();
    await database.close();
    db = null;
}

// Room operations
export async function createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
    const database = ensureDatabase();
    return await database.createRoom(room);
}

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
    const database = ensureDatabase();
    return await database.getRoom(roomId);
}

export async function listRooms(tags?: string[]): Promise<ChatRoom[]> {
    const database = ensureDatabase();
    return await database.listRooms(tags);
}

// Message operations
export async function getRoomMessages(roomId: string, query?: MessageQuery): Promise<MessageQueryResult> {
    const database = ensureDatabase();
    return await database.getRoomMessages(roomId, query);
}

export async function addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const database = ensureDatabase();
    return await database.addMessage(message);
}

export async function clearRoomMessages(roomId: string): Promise<void> {
    const database = ensureDatabase();
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
    const database = ensureDatabase();
    await database.addParticipant(roomId, participant);
}

export async function removeParticipant(roomId: string, username: string): Promise<void> {
    const database = ensureDatabase();
    await database.removeParticipant(roomId, username);
}