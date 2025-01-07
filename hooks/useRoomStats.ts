import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { GlobalStats } from '../server/types';

export function useRoomStats() {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(0);
    const socket = useSocket();

    useEffect(() => {
        if (!socket.socket) return;

        // Set up stats listener
        socket.socket.on('global:stats', (newStats: GlobalStats) => {
            setStats(newStats);
            setLastUpdate(Date.now());
            setError(null);
        });

        // Set up error listener
        socket.socket.on('error', (err: Error) => {
            setError(err.message);
            console.error('Socket error:', err);
        });

        // Request initial stats
        socket.getGlobalStats();

        // Set up periodic refresh
        const refreshInterval = setInterval(() => {
            if (Date.now() - lastUpdate > 30000) { // Refresh if data is older than 30s
                socket.getGlobalStats();
            }
        }, 5000);

        // Cleanup
        return () => {
            if (socket.socket) {
                socket.socket.off('global:stats');
                socket.socket.off('error');
            }
            clearInterval(refreshInterval);
        };
    }, [socket, lastUpdate]);

    return { stats, error, lastUpdate };
}
