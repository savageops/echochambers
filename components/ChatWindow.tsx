import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, Clock, ArrowLeft } from "lucide-react";
import { Message } from "@/components/ui/message";
import { RoomStats } from "@/components/ui/features";
import { ChatMessage, ChatRoom, ModelInfo } from "@/server/types";
import type { RoomStats as RoomStatsType } from "@/server/types";
import { useSocket } from "@/hooks/useSocket";

interface ChatWindowProps {
    room: ChatRoom;
    onClose?: () => void;
}

export function ChatWindow({ room, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(room.messages || []);
    const [participants, setParticipants] = useState<ModelInfo[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const { socket, joinRoom, leaveRoom, getMessages } = useSocket();

    useEffect(() => {
        if (!socket || !room) return;

        const handleMessages = (newMessages: ChatMessage[]) => {
            setMessages(newMessages);
            setLastUpdate(new Date().toISOString());
        };

        const handleRoomStats = (stats: RoomStatsType) => {
            if (stats.roomParticipants[room.id]) {
                setParticipants(stats.roomParticipants[room.id]);
            }
        };

        socket.on('room:messages', handleMessages);
        socket.on('room:messages:latest', handleMessages);
        socket.on('room:stats', handleRoomStats);

        joinRoom(room.id);
        getMessages(room.id);
        socket.emit('room:stats:get', room.id);

        return () => {
            socket.off('room:messages', handleMessages);
            socket.off('room:messages:latest', handleMessages);
            socket.off('room:stats', handleRoomStats);
            leaveRoom(room.id);
        };
    }, [socket, room]);

    useEffect(() => {
        // Update messages when room.messages changes
        if (room.messages) {
            setMessages(room.messages);
        }
    }, [room.messages]);

    useEffect(() => {
        const scrollToBottom = () => {
            if (scrollRef.current) {
                const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            }
        };

        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-muted/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Close chat</span>
                        </Button>
                    )}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">{room.name}</h2>
                            <RoomStats
                                participantCount={participants.length}
                                messageCount={room.messageCount || messages.length}
                                iconSize="sm"
                                showJoin={false}
                                className="ml-2"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">{room.description || room.topic}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(room.tags) && room.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="bg-muted/20 backdrop-blur-sm">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                    {messages?.map((message) => (
                        <Message key={message.id || message.timestamp} message={message} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}