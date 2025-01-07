import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { ChatRoom } from '@/server/types';

export function useRooms() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, onError } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleRooms = (newRooms: ChatRoom[]) => {
            setRooms(newRooms);
            setLoading(false);
        };

        const handleError = (err: { message: string }) => {
            setError(err.message);
            setLoading(false);
        };

        // Listen for room updates
        socket.on('rooms:list', handleRooms);
        
        // Listen for errors
        const cleanup = onError(handleError);

        // Request initial rooms list
        socket.emit('rooms:list:get');

        return () => {
            socket.off('rooms:list', handleRooms);
            cleanup();
        };
    }, [socket, onError]);

    return { rooms, loading, error };
}
