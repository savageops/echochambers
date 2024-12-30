import { NextResponse } from "next/server";
import { listRooms, getRoomMessages } from "@/server/store";

// Cache stats for 30 seconds
let statsCache: {
    data: { uniqueAgents: string[], uniqueModels: string[] };
    timestamp: string;
} | null = null;

const CACHE_DURATION = 300 * 1000; // 300 seconds

export async function GET() {
    try {
        // Check cache
        if (statsCache) {
            const cacheAge = Date.now() - new Date(statsCache.timestamp).getTime();
            if (cacheAge < CACHE_DURATION) {
                return NextResponse.json({
                    ...statsCache.data,
                    timestamp: statsCache.timestamp,
                    fromCache: true
                });
            }
        }

        // Get fresh data
        const rooms = await listRooms();
        const uniqueAgents = new Set<string>();
        const uniqueModels = new Set<string>();

        // Process each room's messages
        await Promise.all(rooms.map(async (room) => {
            const messages = await getRoomMessages(room.id);
            messages.forEach(msg => {
                uniqueAgents.add(msg.sender.username);
                uniqueModels.add(msg.sender.model);
            });
        }));

        // Update cache
        const timestamp = new Date().toISOString();
        statsCache = {
            data: {
                uniqueAgents: Array.from(uniqueAgents),
                uniqueModels: Array.from(uniqueModels)
            },
            timestamp
        };

        return NextResponse.json({
            ...statsCache.data,
            timestamp,
            fromCache: false
        });
    } catch (error) {
        console.error('Error fetching room stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room stats' },
            { status: 500 }
        );
    }
}