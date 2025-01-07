import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as store from './store';
import { ChatMessage, ChatRoom, ModelInfo, MessageQuery, MessageOptions } from './types';

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

export interface SocketServerToClientEvents {
    'room:messages': (messages: ChatMessage[]) => void;
    'room:stats': (stats: RoomStats) => void;
    'room:update': (room: ChatRoom & { participantCount: number }) => void;
    'global:stats': (stats: GlobalStats) => void;
    'error': (error: { message: string }) => void;
}

export interface SocketClientToServerEvents {
    'room:join': (roomId: string) => void;
    'room:leave': (roomId: string) => void;
    'room:messages:get': (roomId: string, options: MessageOptions) => void;
    'room:stats:get': (roomId: string) => void;
    'global:stats:get': () => void;
}

// Socket server instance
let io: SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents> | null = null;

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
        console.log('Checking for updates...');
        
        const rooms = await store.listRooms();
        console.log(`Found ${rooms.length} rooms`);

        let hasChanges = false;
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

                    // Check if room has changes
                    const cachedRoom = roomCache.get(room.id);
                    const hasRoomChanges = !cachedRoom || 
                        cachedRoom.messages.length !== messages.length ||
                        cachedRoom.participants.length !== participants.length ||
                        JSON.stringify(cachedRoom.messages) !== JSON.stringify(messages);

                    if (hasRoomChanges) {
                        hasChanges = true;
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
                        } as RoomCacheData);

                        roomParticipants[room.id] = participants;
                        totalMessageCount += messages.length;

                        // Notify room subscribers of changes
                        io?.to(room.id).emit('room:messages', messages);
                        io?.to(room.id).emit('room:stats', roomStats);
                        io?.to(room.id).emit('room:update', {
                            ...room,
                            messageCount: messages.length,
                            participantCount
                        });
                    } else {
                        // Use cached values for global stats
                        participants.forEach(participant => {
                            globalParticipantsMap.set(participant.username, participant);
                        });
                        uniqueModels.forEach(m => globalModels.add(m));
                        roomParticipants[room.id] = participants;
                        totalMessageCount += messages.length;
                    }

                } catch (error) {
                    console.error(`Error updating cache for room ${room.id}:`, error);
                }
            }));

            // Add delay between batches to prevent timeouts
            if (i + BATCH_SIZE < rooms.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (hasChanges) {
            const globalParticipants = Array.from(globalParticipantsMap.values());

            // Update global stats
            const newGlobalStats: GlobalStats = {
                uniqueAgents: globalParticipants,
                uniqueModels: Array.from(globalModels),
                roomParticipants,
                messageCount: totalMessageCount,
                participantCount: globalParticipants.length,
                timestamp: new Date().toISOString(),
                lastUpdate: Date.now()
            };

            // Check if global stats have changed
            if (!globalStats || 
                JSON.stringify(globalStats.uniqueAgents) !== JSON.stringify(newGlobalStats.uniqueAgents) ||
                globalStats.messageCount !== newGlobalStats.messageCount) {
                
                globalStats = newGlobalStats;
                io?.emit('global:stats', globalStats);
            }

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
        } else {
            console.log('No changes detected, skipping update');
        }

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

// Socket event handlers
const handleConnection = (socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>) => {
    console.log('Client connected');

    // Send global stats immediately on connection
    if (globalStats) {
        socket.emit('global:stats', globalStats);
    }

    // Handle room join
    socket.on('room:join', async (roomId: string) => {
        try {
            socket.join(roomId);
            const room = await store.getRoom(roomId);
            if (room) {
                const cached = roomCache.get(roomId);
                if (cached) {
                    socket.emit('room:messages', cached.messages);
                    socket.emit('room:stats', cached.stats);
                    socket.emit('room:update', cached.room);
                }
            }
        } catch (error) {
            console.error(`Error joining room ${roomId}:`, error);
        }
    });

    // Handle room leave
    socket.on('room:leave', (roomId: string) => {
        socket.leave(roomId);
    });

    // Handle get requests
    socket.on('room:messages:get', async (roomId: string, options: MessageOptions = {}) => {
        try {
            const cached = roomCache.get(roomId);
            if (cached) {
                let messages = cached.messages;
                if (options.limit) {
                    messages = messages.slice(-options.limit);
                }
                if (options.cursor) {
                    const cursorIndex = messages.findIndex(m => m.id === options.cursor);
                    if (cursorIndex !== -1) {
                        messages = messages.slice(cursorIndex + 1);
                    }
                }
                socket.emit('room:messages', messages);
            }
        } catch (error) {
            console.error(`Error getting messages for room ${roomId}:`, error);
            socket.emit('error', { message: `Failed to get messages: ${error.message}` });
        }
    });

    socket.on('room:stats:get', async (roomId: string) => {
        try {
            const cached = roomCache.get(roomId);
            if (cached) {
                socket.emit('room:stats', cached.stats);
            }
        } catch (error) {
            console.error(`Error getting stats for room ${roomId}:`, error);
        }
    });

    socket.on('global:stats:get', () => {
        if (globalStats) {
            socket.emit('global:stats', globalStats);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
};

export const initSocket = async (socketServer: SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents>) => {
    io = socketServer;

    // Wait for cache to be initialized before accepting connections
    await waitForInitialization();
    console.log('Socket server ready to accept connections');

    io.on('connection', handleConnection);

    // Start background cache update
    if (!updateInterval) {
        updateInterval = setInterval(updateCache, CACHE_UPDATE_INTERVAL);
        updateCache().catch(console.error);
    }

    return io;
};

export const closeSocket = async () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    if (io) {
        await io.close();
        io = null;
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
