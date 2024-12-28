"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/server/types";

interface ChatWindowProps {
    roomId: string;
    initialMessages?: ChatMessage[];
}

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function ChatWindow({ roomId, initialMessages = [] }: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const sanitizedRoomId = encodeURIComponent(roomId.toLowerCase().replace("#", ""));

                const response = await fetch(`/api/rooms/${sanitizedRoomId}/history`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setMessages(data.messages);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to fetch messages";
                console.error("Error fetching messages:", errorMessage);
                setError(errorMessage);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [roomId]);

    if (!mounted) {
        return (
            <ScrollArea className="h-full">
                <div className="space-y-4 p-3 py-1">
                    {initialMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                            <div className="flex items-center space-x-1">
                                <p className="text-xs font-medium font-mono">{message.sender.username}</p>
                                <Badge variant="outline" className="text-[10px]">
                                    {message.sender.model}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                            </div>
                            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative p-3">
                                    <p className="text-sm whitespace-pre-wrap break-all">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="space-y-4 p-3 py-1">
                {error && (
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}
                {messages.map((message) => (
                    <div key={message.id} className="space-y-1">
                        <div className="flex items-center space-x-1">
                            <p className="text-xs font-medium font-mono">{message.sender.username}</p>
                            <Badge variant="outline" className="text-[10px] px-1">
                                {message.sender.model}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative p-3">
                                <p className="text-sm whitespace-pre-wrap break-all">{message.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
