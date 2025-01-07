import { Server as SocketIOServer } from 'socket.io';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery } from './types';
import * as store from './store';

// Type definitions
interface RoomStats {
    uniqueAgents: ModelInfo[];
    uniqueModels: string[];
    roomParticipants: Record<string, ModelInfo[]>;
    participantCount: number;
    timestamp: string;
}

interface RoomCacheData {
    messages: ChatMessage[];
    stats: RoomStats;
    room: ChatRoom & {
        participantCount: number;
    };
    participants: ModelInfo[];
    uniqueAgents: ModelInfo[];
    uniqueModels: string[];
    timestamp: number;
    lastUpdate: number;
}

interface GlobalStats {
    uniqueAgents: ModelInfo[];
    uniqueModels: string[];
    roomParticipants: Record<string, ModelInfo[]>;
    messageCount: number;
    participantCount: number;
    timestamp: string;
    lastUpdate: number;
}

export interface ServerToClientEvents {
    'room:messages': (messages: ChatMessage[]) => void;
    'room:update': (room: ChatRoom) => void;
    'room:stats': (stats: RoomStats) => void;
    'global:stats': (stats: GlobalStats) => void;
    'error': (error: { message: string }) => void;
}

export interface ClientToServerEvents {
    'room:join': (roomId: string) => void;
    'room:messages:get': (roomId: string) => void;
    'stats:get': () => void;
}

// Cache management
const roomCache = new Map<string, RoomCacheData>();
let globalStats: GlobalStats | null = null;
const CACHE_UPDATE_INTERVAL = 12000; // 12 seconds
const MESSAGE_LIMIT = 21;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 3000; // 3 seconds
let isInitialized = false;
let isUpdating = false;
let updateInterval: NodeJS.Timeout | null = null;

// Calculate participants for a room
const calculateRoomParticipants = (messages: ChatMessage[]) => {
    const participantsMap = new Map<string, ModelInfo>();
    const models = new Set<string>();

    messages.forEach(message => {
        const { username, model } = message.sender;
        if (!participantsMap.has(username)) {
            participantsMap.set(username, {
                username,
                model: model || 'unknown'
            });
        }
        if (model) {
            models.add(model);
        }
    });

    const participants = Array.from(participantsMap.values());

    return {
        participants,
        uniqueAgents: participants,
        uniqueModels: Array.from(models),
        participantCount: participants.length
    };
};

// Background process to update cache
const updateCache = async (retryAttempt = 0): Promise<void> => {
    if (isUpdating) {
        console.log('Cache update already in progress, skipping...');
        return;
    }

    const startTime = Date.now();
    isUpdating = true;
    
    try {
        console.log('Updating global cache...');
        
        const rooms = await store.listRooms();
        console.log(`Found ${rooms.length} rooms`);

        const globalParticipantsMap = new Map<string, ModelInfo>();
        const globalModels = new Set<string>();
        const roomParticipants: Record<string, ModelInfo[]> = {};
        let totalMessageCount = 0;

        // Process rooms in smaller batches with delay
        const BATCH_SIZE = 3;
        for (let i = 0; i < rooms.length; i += BATCH_SIZE) {
            const batch = rooms.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (room) => {
                try {
                    // Get messages sorted by timestamp desc
                    const query: MessageQuery = { 
                        limit: MESSAGE_LIMIT
                    };
                    const messages = await store.getRoomMessages(room.id, query);

                    const { participants, uniqueAgents, uniqueModels, participantCount } = calculateRoomParticipants(messages);

                    // Update global tracking
                    participants.forEach(participant => {
                        globalParticipantsMap.set(participant.username, participant);
                    });
                    uniqueModels.forEach(m => globalModels.add(m));

                    // Create room stats
                    const roomStats: RoomStats = {
                        uniqueAgents,
                        uniqueModels,
                        roomParticipants: { [room.id]: participants },
                        participantCount,
                        timestamp: new Date().toISOString()
                    };

                    // Update room cache
                    roomCache.set(room.id, {
                        messages,
                        stats: roomStats,
                        room: {
                            ...room,
                            messageCount: messages.length,
                            participantCount,
                        },
                        participants,
                        uniqueAgents,
                        uniqueModels,
                        timestamp: Date.now(),
                        lastUpdate: Date.now()
                    });

                    roomParticipants[room.id] = participants;
                    totalMessageCount += messages.length;

                } catch (error) {
                    console.error(`Error updating cache for room ${room.id}:`, error);
                }
            }));

            // Add delay between batches to prevent timeouts
            if (i + BATCH_SIZE < rooms.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const globalParticipants = Array.from(globalParticipantsMap.values());

        // Update global stats
        globalStats = {
            uniqueAgents: globalParticipants,
            uniqueModels: Array.from(globalModels),
            roomParticipants,
            messageCount: totalMessageCount,
            participantCount: globalParticipants.length,
            timestamp: new Date().toISOString(),
            lastUpdate: Date.now()
        };

        const updateDuration = Date.now() - startTime;
        console.log('Cache update complete:', {
            duration: `${updateDuration}ms`,
            roomCount: rooms.length,
            uniqueAgents: globalParticipants.length,
            uniqueModels: globalModels.size,
            totalMessages: totalMessageCount,
            totalParticipants: globalParticipants.length,
            timestamp: new Date().toISOString()
        });

        isInitialized = true;

    } catch (error) {
        console.error('Error updating cache:', error);
        
        // Retry logic with exponential backoff
        if (retryAttempt < MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_DELAY * Math.pow(2, retryAttempt);
            console.log(`Retrying cache update in ${delay}ms (attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`);
            
            setTimeout(() => {
                updateCache(retryAttempt + 1).catch(console.error);
            }, delay);
        } else {
            console.error('Max retry attempts reached. Cache update failed.');
            if (!isInitialized) {
                process.exit(1); // Only exit if initial cache load fails
            }
        }
    } finally {
        isUpdating = false;
    }
};

// Initialize cache and start background updates
const initializeCache = async () => {
    console.log('Initializing socket server cache...');
    
    try {
        await updateCache();
        console.log('Cache initialized, starting background updates every 6 seconds');
        
        // Clear any existing interval
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        // Start periodic updates with error handling
        updateInterval = setInterval(() => {
            updateCache().catch(error => {
                console.error('Background cache update failed:', error);
            });
        }, CACHE_UPDATE_INTERVAL);
        
    } catch (error) {
        console.error('Failed to initialize cache:', error);
        throw error;
    }
};

// Export a function to wait for initialization
export const waitForInitialization = async (timeoutMs: number = 30000) => {
    if (isInitialized) return;
    
    const startTime = Date.now();
    
    while (!isInitialized && Date.now() - startTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!isInitialized) {
        throw new Error('Cache initialization timed out');
    }
};

// Initialize cache immediately with cleanup
initializeCache().catch(error => {
    console.error('Failed to initialize socket server cache:', error);
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    process.exit(1);
});

// Clean up on process exit
process.on('SIGTERM', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

process.on('SIGINT', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

export const initSocket = async (io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) => {
    // Wait for cache to be initialized before accepting connections
    await waitForInitialization();
    console.log('Socket server ready to accept connections');

    io.on('connection', (socket) => {
        console.log('Client connected');

        // Send global stats immediately on connection
        if (globalStats) {
            socket.emit('global:stats', globalStats);
        }

        socket.on('room:join', async (roomId: string) => {
            try {
                socket.join(roomId);
                console.log(`Client joined room ${roomId}`);
                
                const cached = roomCache.get(roomId);
                if (cached) {
                    // Send cached data immediately
                    socket.emit('room:messages', cached.messages);
                    socket.emit('room:stats', cached.stats);
                    socket.emit('room:update', cached.room);
                    if (globalStats) {
                        socket.emit('global:stats', globalStats);
                    }
                }
            } catch (error) {
                console.error(`Error joining room ${roomId}:`, error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        socket.on('room:messages:get', async (roomId: string) => {
            try {
                const cached = roomCache.get(roomId);
                if (cached) {
                    socket.emit('room:messages', cached.messages);
                }
            } catch (error) {
                console.error(`Error getting messages for room ${roomId}:`, error);
                socket.emit('error', { message: 'Failed to get messages' });
            }
        });

        socket.on('stats:get', () => {
            if (globalStats) {
                socket.emit('global:stats', globalStats);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};
