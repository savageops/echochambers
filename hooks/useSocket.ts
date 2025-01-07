import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MessageOptions, MessageDelta } from '../server/types';

interface UseSocketOptions {
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useSocket(options: UseSocketOptions = {}) {
    const {
        autoReconnect = true,
        reconnectInterval = 5000,
        maxReconnectAttempts = 5
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const messageCache = useRef<Map<string, ChatMessage[]>>(new Map());
    const cursorCache = useRef<Map<string, string>>(new Map());
    const errorListeners = useRef<Set<(error: { message: string }) => void>>(new Set());

    const onError = useCallback((handler: (error: { message: string }) => void) => {
        errorListeners.current.add(handler);
        return () => {
            errorListeners.current.delete(handler);
        };
    }, []);

    const notifyErrorListeners = useCallback((err: { message: string }) => {
        errorListeners.current.forEach(listener => listener(err));
    }, []);

    const connect = useCallback(() => {
        try {
            if (!socketRef.current) {
                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
                console.log('Connecting to socket server at:', socketUrl);
                
                socketRef.current = io(socketUrl, {
                    reconnection: autoReconnect,
                    reconnectionDelay: reconnectInterval,
                    reconnectionAttempts: maxReconnectAttempts,
                    transports: ['websocket', 'polling'],
                    timeout: 10000,
                    forceNew: true
                });

                socketRef.current.on('connect', () => {
                    console.log('Socket connected successfully');
                    setIsConnected(true);
                    setError(null);
                    reconnectAttemptsRef.current = 0;
                });

                socketRef.current.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                    setIsConnected(false);
                    if (reason === 'io server disconnect') {
                        setTimeout(() => {
                            connect();
                        }, reconnectInterval);
                    }
                });

                socketRef.current.on('connect_error', (err) => {
                    const error = { message: `Connection failed: ${err.message}` };
                    console.error('Socket connection error:', error.message);
                    setError(new Error(error.message));
                    setIsConnected(false);
                    notifyErrorListeners(error);
                    
                    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                        reconnectAttemptsRef.current++;
                        console.log(`Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
                        setTimeout(() => {
                            console.log('Attempting to reconnect...');
                            connect();
                        }, reconnectInterval);
                    }
                });

                socketRef.current.on('error', (err: { message: string }) => {
                    console.error('Socket error:', err.message);
                    setError(new Error(err.message));
                    notifyErrorListeners(err);
                    if (!isConnected) {
                        setTimeout(() => {
                            connect();
                        }, reconnectInterval);
                    }
                });
            }
        } catch (err) {
            const error = { 
                message: err instanceof Error ? err.message : 'Failed to initialize socket'
            };
            console.error('Failed to initialize socket:', error.message);
            setError(new Error(error.message));
            notifyErrorListeners(error);
            setTimeout(() => {
                connect();
            }, reconnectInterval);
        }
    }, [autoReconnect, reconnectInterval, maxReconnectAttempts, notifyErrorListeners]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
        setError(null);
        errorListeners.current.clear();
    }, []);

    const joinRoom = useCallback((roomId: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('room:join', roomId);
        }
    }, [isConnected]);

    const leaveRoom = useCallback((roomId: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('room:leave', roomId);
        }
    }, [isConnected]);

    const getMessages = useCallback((roomId: string, options: MessageOptions = {}) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('room:messages:get', roomId, options);
        }
    }, [isConnected]);

    const syncMessages = useCallback((roomId: string) => {
        if (socketRef.current && isConnected) {
            const lastCursor = cursorCache.current.get(roomId);
            if (lastCursor) {
                socketRef.current.emit('room:messages:sync', roomId, lastCursor);
            }
        }
    }, [isConnected]);

    const getGlobalStats = useCallback(() => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('global:stats:get');
        }
    }, [isConnected]);

    const handleMessageDelta = useCallback((delta: MessageDelta) => {
        const currentMessages = messageCache.current.get(delta.roomId) || [];
        const updatedMessages = [...currentMessages];

        // Remove deleted messages
        delta.removed.forEach(id => {
            const index = updatedMessages.findIndex(msg => msg.id === id);
            if (index !== -1) {
                updatedMessages.splice(index, 1);
            }
        });

        // Update modified messages
        delta.modified.forEach(msg => {
            const index = updatedMessages.findIndex(m => m.id === msg.id);
            if (index !== -1) {
                updatedMessages[index] = msg;
            }
        });

        // Add new messages
        updatedMessages.push(...delta.added);

        // Update cache
        messageCache.current.set(delta.roomId, updatedMessages);
        cursorCache.current.set(delta.roomId, delta.cursor);

        return updatedMessages;
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            errorListeners.current.clear();
        };
    }, [connect]);

    return {
        socket: socketRef.current,
        isConnected,
        error,
        connect,
        disconnect,
        joinRoom,
        leaveRoom,
        getMessages,
        syncMessages,
        getGlobalStats,
        handleMessageDelta,
        onError
    };
}
