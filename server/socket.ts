import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as store from './store';
import {
    ChatMessage,
    ChatRoom,
    ModelInfo,
    MessageQuery,
    MessageQueryResult,
    MessageDelta,
    MessageOptions
} from './types';

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
    messageDeltas: MessageDelta[];
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

// Socket event interfaces
export interface SocketServerToClientEvents {
    'room:messages': (messages: ChatMessage[]) => void;
    'room:messages:delta': (delta: MessageDelta) => void;
    'room:stats': (stats: RoomStats) => void;
    'room:update': (room: ChatRoom & { participantCount: number }) => void;
    'global:stats': (stats: GlobalStats) => void;
    'error': (error: { message: string }) => void;
    'room:messages:latest': (messages: ChatMessage[]) => void;
}

export interface SocketClientToServerEvents {
    'room:join': (roomId: string) => void;
    'room:leave': (roomId: string) => void;
    'room:messages:get': (roomId: string, options: MessageOptions) => void;
    'room:messages:sync': (roomId: string, lastCursor: string) => void;
    'room:stats:get': (roomId: string) => void;
    'global:stats:get': () => void;
    'room:messages:latest': (roomId: string) => void;
}

// Socket server instance
export let io: SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents> | null = null;

// Cache management
const roomCache = new Map<string, RoomCacheData>();
let globalStats: GlobalStats | null = null;
const CACHE_UPDATE_INTERVAL = 21000; // 21 seconds
const MESSAGE_LIMIT = 30;
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

// Calculate message delta
function calculateMessageDelta(oldMessages: ChatMessage[], newMessages: ChatMessage[]): MessageDelta {
    const oldMap = new Map(oldMessages.map(m => [m.id, m]));
    const newMap = new Map(newMessages.map(m => [m.id, m]));
    
    const added: ChatMessage[] = [];
    const modified: ChatMessage[] = [];
    const removed: string[] = [];

    // Find added and modified messages
    for (const [id, message] of newMap) {
        const oldMessage = oldMap.get(id);
        if (!oldMessage) {
            added.push(message);
        } else if (JSON.stringify(oldMessage) !== JSON.stringify(message)) {
            modified.push(message);
        }
    }

    // Find removed messages
    for (const id of oldMap.keys()) {
        if (!newMap.has(id)) {
            removed.push(id);
        }
    }

    return {
        added,
        modified,
        removed,
        cursor: newMessages.length > 0 ? newMessages[newMessages.length - 1].id : '',
        roomId: newMessages[0]?.roomId || '',
        timestamp: new Date().toISOString()
    };
}

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
        const BATCH_SIZE = 9;
        for (let i = 0; i < rooms.length; i += BATCH_SIZE) {
            const batch = rooms.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (room) => {
                try {
                    // Get messages sorted by timestamp desc
                    const query: MessageQuery = { 
                        limit: MESSAGE_LIMIT
                    };
                    const result: MessageQueryResult = await store.getRoomMessages(room.id, query);

                    const { participants, uniqueAgents, uniqueModels, participantCount } = calculateRoomParticipants(result.messages);

                    // Check if room has changes
                    const cachedRoom = roomCache.get(room.id);
                    const hasRoomChanges = !cachedRoom || 
                        cachedRoom.messages.length !== result.messages.length ||
                        cachedRoom.participants.length !== participants.length ||
                        JSON.stringify(cachedRoom.messages) !== JSON.stringify(result.messages);

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
                            messages: result.messages,
                            messageDeltas: [],
                            stats: roomStats,
                            room: {
                                ...room,
                                messageCount: result.messages.length,
                                participantCount,
                            },
                            participants,
                            uniqueAgents,
                            uniqueModels,
                            timestamp: Date.now(),
                            lastUpdate: Date.now()
                        } as RoomCacheData);

                        roomParticipants[room.id] = participants;
                        totalMessageCount += result.messages.length;

                        // Notify room subscribers of changes
                        io?.to(room.id).emit('room:messages', result.messages);
                        io?.to(room.id).emit('room:stats', roomStats);
                        io?.to(room.id).emit('room:update', {
                            ...room,
                            messageCount: result.messages.length,
                            participantCount
                        });
                    } else {
                        // Use cached values for global stats
                        participants.forEach(participant => {
                            globalParticipantsMap.set(participant.username, participant);
                        });
                        uniqueModels.forEach(m => globalModels.add(m));
                        roomParticipants[room.id] = participants;
                        totalMessageCount += result.messages.length;
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
async function handleConnection(socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>) {
    if (!io) {
        throw new Error('Socket server not initialized');
    }

    const subscribedRooms = new Set<string>();

    socket.on('room:join', async (roomId: string) => {
        try {
            subscribedRooms.add(roomId);
            socket.join(roomId);
            
            const cached = roomCache.get(roomId);
            if (cached) {
                socket.emit('room:stats', cached.stats);
                socket.emit('room:update', cached.room);
            }
        } catch (error: unknown) {
            console.error(`Error joining room ${roomId}:`, error);
            socket.emit('error', { 
                message: error instanceof Error ? error.message : 'Unknown error occurred' 
            });
        }
    });

    socket.on('room:leave', (roomId: string) => {
        socket.leave(roomId);
    });

    socket.on('room:messages:get', async (roomId: string, options: MessageOptions = {}) => {
        try {
            const cached = roomCache.get(roomId);
            if (cached) {
                // First, emit cached messages immediately
                if (cached.messages.length > 0) {
                    const cachedMessages = cached.messages.filter(msg => {
                        if (options.before) return msg.timestamp < options.before;
                        if (options.after) return msg.timestamp > options.after;
                        return true;
                    }).slice(0, options.limit || 30);

                    if (cachedMessages.length > 0) {
                        socket.emit('room:messages', cachedMessages);
                    }
                }

                // Then fetch fresh messages from the database
                const result = await store.getRoomMessages(roomId, {
                    limit: options.limit,
                    before: options.before,
                    after: options.after
                });

                // Only emit if there are differences
                if (JSON.stringify(result.messages) !== JSON.stringify(cached.messages)) {
                    socket.emit('room:messages', result.messages);
                    
                    // Update cache with new messages
                    cached.messages = result.messages;
                    cached.lastUpdate = Date.now();
                    roomCache.set(roomId, cached);
                }
            }
        } catch (error: unknown) {
            console.error(`Error getting messages for room ${roomId}:`, error);
            socket.emit('error', { 
                message: error instanceof Error ? error.message : 'Unknown error occurred' 
            });
        }
    });

    socket.on('room:messages:sync', async (roomId: string, lastCursor: string) => {
        try {
            const cached = roomCache.get(roomId);
            if (cached) {
                // First check if we have the delta in cache
                const cachedDelta = cached.messageDeltas.find(d => d.cursor === lastCursor);
                if (cachedDelta) {
                    socket.emit('room:messages:delta', cachedDelta);
                    return;
                }

                // If not in cache, fetch from database
                const result = await store.getRoomMessages(roomId, { after: lastCursor });
                if (result.messages.length > 0) {
                    const delta = calculateMessageDelta(cached.messages, result.messages);
                    socket.emit('room:messages:delta', delta);
                    
                    // Update cache with new messages
                    cached.messages = result.messages;
                    cached.messageDeltas.push(delta);
                    cached.lastUpdate = Date.now();
                    
                    // Keep only last 10 deltas
                    if (cached.messageDeltas.length > 10) {
                        cached.messageDeltas.shift();
                    }
                    roomCache.set(roomId, cached);
                }
            }
        } catch (error: unknown) {
            console.error(`Error syncing messages for room ${roomId}:`, error);
            socket.emit('error', { 
                message: error instanceof Error ? error.message : 'Unknown error occurred' 
            });
        }
    });

    socket.on('room:messages:latest', async (roomId: string) => {
        try {
            // Get only the latest message
            const result = await store.getRoomMessages(roomId, { limit: 1 });
            const latestMessages = result.messages;
            if (latestMessages.length > 0) {
                socket.emit('room:messages:latest', latestMessages);
            }
        } catch (error) {
            console.error('Error fetching latest message:', error);
            socket.emit('error', { message: 'Failed to fetch latest message' });
        }
    });

    socket.on('room:stats:get', async (roomId: string) => {
        try {
            const cached = roomCache.get(roomId);
            if (cached) {
                socket.emit('room:stats', cached.stats);
            }
        } catch (error: unknown) {
            console.error(`Error getting stats for room ${roomId}:`, error);
            socket.emit('error', { 
                message: error instanceof Error ? error.message : 'Unknown error occurred' 
            });
        }
    });

    socket.on('global:stats:get', async () => {
        try {
            // Get stats from cache
            const stats = await getGlobalStats();
            if (!stats) {
                throw new Error('No stats available');
            }
            socket.emit('global:stats', stats);
        } catch (error) {
            console.error('Error fetching global stats:', error);
            socket.emit('error', { message: 'Failed to fetch global stats' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
};

export function initSocket(socketServer: SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents>) {
    io = socketServer;

    // Wait for cache to be initialized before accepting connections
    waitForInitialization().then(() => {
        if (!io) {
            throw new Error('Socket server not initialized');
        }
        console.log('Socket server ready to accept connections');
        io.on('connection', handleConnection);
    }).catch(error => {
        console.error('Failed to initialize socket server:', error);
        process.exit(1);
    });

    // Start background cache update
    if (!updateInterval) {
        updateInterval = setInterval(() => {
            console.log('Checking for updates...');
            updateCache().catch(error => {
                console.error('Background cache update failed:', error);
            });
        }, CACHE_UPDATE_INTERVAL);
    }
}

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

const getGlobalStats = async (): Promise<GlobalStats> => {
    if (!globalStats) {
        throw new Error('Global stats not initialized');
    }
    return globalStats;
};
