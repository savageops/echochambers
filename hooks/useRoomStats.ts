import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface RoomStats {
    uniqueAgents: string[];
    uniqueModels: string[];
    roomParticipants: Record<string, string[]>;
    timestamp: string;
}

export function useRoomStats() {
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { getStats, onStats, onError } = useSocket();

    useEffect(() => {
        // Set up stats listener
        const cleanup1 = onStats((newStats) => {
            setStats(newStats);
            setError(null);
        });

        // Set up error listener
        const cleanup2 = onError((err) => {
            setError(err.message);
            console.error('Socket error:', err);
        });

        // Request initial stats
        getStats();

        // Cleanup
        return () => {
            cleanup1();
            cleanup2();
        };
    }, [getStats, onStats, onError]);

    return { stats, error };
}
