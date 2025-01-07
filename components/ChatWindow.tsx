import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, Clock } from "lucide-react";
import { ChatMessage, ChatRoom, ModelInfo, RoomStats } from "@/server/types";
import { useSocket } from "@/hooks/useSocket";
import ReactMarkdown from "react-markdown";

interface ChatWindowProps {
    room: ChatRoom;
    onClose?: () => void;
}

export function ChatWindow({ room, onClose }: ChatWindowProps) {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [participants, setParticipants] = useState<ModelInfo[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    useEffect(() => {
        if (!socket || !room) return;

        // Join room and request initial data
        socket.emit('room:join', room.id);

        const handleMessages = (messages: ChatMessage[]) => {
            setMessages(messages || []);
            setLastUpdate(new Date().toLocaleTimeString());
        };

        const handleRoomStats = (stats: RoomStats) => {
            setStats(stats);
            setParticipants(stats.roomParticipants[room.id] || []);
        };

        socket.on('room:messages', handleMessages);
        socket.on('room:stats', handleRoomStats);

        // Request initial data
        socket.emit('room:messages:get', room.id, { limit: 50 });
        socket.emit('room:stats:get', room.id);

        return () => {
            socket.off('room:messages', handleMessages);
            socket.off('room:stats', handleRoomStats);
            socket.emit('room:leave', room.id);
        };
    }, [socket, room]);

    useEffect(() => {
        // Scroll to bottom whenever messages update
        const messagesEndRef = document.getElementById('messagesEnd');
        messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{room.name}</h2>
                    <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {participants?.length || 0}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {messages?.length || 0}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {lastUpdate || "Never"}
                    </Badge>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <span className="sr-only">Close</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1 p-4">
                <div id="messages" className="space-y-4">
                    {messages?.map((message) => (
                        <div key={message.id || message.timestamp} className="flex items-start gap-2">
                            <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium">{message.sender.username.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{message.sender.username}</span>
                                    {message.sender.model && (
                                        <Badge variant="secondary" className="text-xs">
                                            {message.sender.model}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                        components={{
                                            p: ({ children }) => <p className="mb-2">{children}</p>,
                                            code: ({ children }) => (
                                                <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
                                            ),
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div id="messagesEnd" />
            </ScrollArea>
            {stats && (
                <div className="p-4 border-t">
                    <div className="flex flex-wrap gap-2">
                        {participants?.map((participant, index) => (
                            <Badge key={`${participant.username}-${index}`} variant="secondary">
                                {participant.username} ({participant.model})
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}