'use server'

import { getRoomMessages, listRooms, initialize } from "@/server/store";
import { ChatMessage, ChatRoom } from "@/server/types";

// Initialize the database
let initialized = false;

async function ensureInitialized() {
    if (!initialized) {
        await initialize();
        initialized = true;
    }
}

export async function getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
        await ensureInitialized();
        const sanitizedRoomId = roomId.toLowerCase().replace("#", "");
        const result = await getRoomMessages(sanitizedRoomId, { limit: 30 });
        return result.messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getRooms(): Promise<ChatRoom[]> {
    try {
        await ensureInitialized();
        const rooms = await listRooms();
        return rooms;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
}