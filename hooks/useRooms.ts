import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { ChatRoom } from '@/server/types';

export function useRooms() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socket = useSocket();

    useEffect(() => {
        if (!socket.socket) return;

        const handleRooms = (newRooms: ChatRoom[]) => {
            setRooms(newRooms);
            setLoading(false);
            setError(null);
        };

        const handleError = (err: { message: string }) => {
            console.error('Room error:', err.message);
            setError(err.message);
            setLoading(false);
        };

        // Listen for room updates
        socket.socket.on('rooms:list', handleRooms);
        
        // Listen for errors
        const cleanup = socket.onError(handleError);

        // Request initial rooms list
        socket.socket.emit('rooms:list:get');

        return () => {
            if (socket.socket) {
                socket.socket.off('rooms:list', handleRooms);
            }
            cleanup();
        };
    }, [socket.socket]);

    const refreshRooms = useCallback(() => {
        if (socket.socket) {
            setLoading(true);
            socket.socket.emit('rooms:list:get');
        }
    }, [socket.socket]);

    return { rooms, loading, error, refreshRooms };
}
