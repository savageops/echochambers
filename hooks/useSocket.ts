import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatRoom, ServerToClientEvents, ClientToServerEvents, GlobalStats, RoomStats, MessageOptions } from '@/server/types';

export function useSocket() {
    const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 1000; // 1 second

    const connect = useCallback(() => {
        if (socket.current?.connected) {
            console.log('Socket already connected');
            setIsConnected(true);
            return;
        }

        console.log('Connecting socket...');
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: RECONNECT_DELAY,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        socket.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            reconnectAttempts.current = 0;
        });

        socket.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.current.on('error', (error) => {
            console.error('Socket error:', error);
        });

    }, []);

    const getMessages = useCallback((roomId: string, options: MessageOptions = {}) => {
        if (!socket.current?.connected) {
            console.log('Socket not connected, connecting...');
            connect();
            return;
        }
        console.log('Getting messages for room:', roomId, options);
        socket.current.emit('room:messages:get', roomId, options);
    }, [connect]);

    const getRoomStats = useCallback((roomId: string) => {
        if (!socket.current?.connected) {
            console.log('Socket not connected, connecting...');
            connect();
            return;
        }
        console.log('Getting stats for room:', roomId);
        socket.current.emit('room:stats:get', roomId);
    }, [connect]);

    const getGlobalStats = useCallback(() => {
        if (!socket.current?.connected) {
            console.log('Socket not connected, connecting...');
            connect();
            return;
        }
        console.log('Getting global stats');
        socket.current.emit('global:stats:get');
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [connect]);

    return {
        socket: socket.current,
        isConnected,
        connect,
        getMessages,
        getRoomStats,
        getGlobalStats
    };
}
