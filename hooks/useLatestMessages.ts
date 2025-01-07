import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/server/types';
import { useSocket } from './useSocket';

// Separate event name for latest messages to not interfere with room cache
const LATEST_MESSAGE_EVENT = 'room:messages:latest';

export function useLatestMessages() {
    const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const { socket, isConnected, error: socketError } = useSocket();
    const notifiedMessages = useRef<Set<string>>(new Set());
    const initialLoadDone = useRef(false);

    const handleNewMessage = useCallback((message: ChatMessage) => {  
        // Only update if this message is newer than our current latest
        // and we haven't notified about it before
        if (!notifiedMessages.current.has(message.id) && 
            (!latestMessage || new Date(message.timestamp) > new Date(latestMessage.timestamp))) {
            notifiedMessages.current.add(message.id);
            setLatestMessage(message);
        }
    }, [latestMessage]);

    const handleMessages = useCallback((messages: ChatMessage[]) => {
        if (!Array.isArray(messages) || messages.length === 0) {
            return;
        }

        // Find the most recent message we haven't notified about
        const mostRecent = messages.reduce((latest, current) => {
            if (notifiedMessages.current.has(current.id)) {
                return latest;
            }
            if (!latest) return current;
            return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
        }, null as ChatMessage | null);

        if (mostRecent) {
            notifiedMessages.current.add(mostRecent.id);
            setLatestMessage(mostRecent);
        }
    }, []);

    // Reset notifications when disconnected
    useEffect(() => {
        if (!isConnected) {
            notifiedMessages.current.clear();
            initialLoadDone.current = false;
        }
    }, [isConnected]);

    useEffect(() => {
        if (!socket || !isConnected) {
            return;
        }
        
        // Subscribe to global stats to get all room IDs
        socket.emit('global:stats:get');
        
        socket.on('global:stats', (stats) => {
            if (!stats?.roomParticipants) {
                return;
            }
            
            // Join all rooms but request latest message separately
            Object.keys(stats.roomParticipants).forEach(roomId => {
                socket.emit('room:join', roomId);
                socket.emit(LATEST_MESSAGE_EVENT, roomId);
            });
        });

        // Listen for latest messages only
        socket.on(LATEST_MESSAGE_EVENT, handleMessages);
        socket.on('room:messages:delta', (delta) => {
            if (delta?.added?.[0]) {
                handleNewMessage(delta.added[0]);
            }
        });

        return () => {
            console.log('Cleaning up socket listeners');
            socket.off('global:stats');
            socket.off(LATEST_MESSAGE_EVENT);
            socket.off('room:messages:delta');
        };
    }, [socket, isConnected, handleMessages, handleNewMessage]);

    useEffect(() => {
        if (socketError) {
            console.error('Socket error:', socketError);
            setError(new Error(socketError.message));
        }
    }, [socketError]);

    return {
        latestMessage,
        error,
        isConnected
    };
}
