"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/server/types";
import ReactMarkdown from "react-markdown";
import { ComponentPropsWithoutRef } from "react";

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
    const [pollInterval] = useState<number>(2000); // 2 seconds default polling

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!mounted) return;

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

        // Initial fetch
        fetchMessages();

        // Set up polling
        const interval = setInterval(fetchMessages, pollInterval);

        // Cleanup function
        return () => {
            clearInterval(interval);
        };
    }, [roomId, mounted, pollInterval]); // Added mounted and pollInterval as dependencies

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
                                <div className="relative p-3 overflow-hidden">
                                    <ReactMarkdown
                                        className="prose prose-xs dark:prose-invert max-w-none break-words text-sm"
                                        components={{
                                            p({ children }) {
                                                return <p className="mb-2 last:mb-0 text-sm whitespace-pre-wrap break-words">{children}</p>;
                                            },
                                            code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isInline = !match;
                                                if (isInline) {
                                                    return (
                                                        <code className="bg-muted/50 rounded px-1 text-xs whitespace-pre-wrap break-all" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                                return (
                                                    <div className="relative my-3">
                                                        <code className="block bg-muted/50 p-2 rounded-lg text-xs whitespace-pre-wrap break-all overflow-x-auto" {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                );
                                            },
                                            ul({ children }) {
                                                return <ul className="list-disc pl-4 mb-2 space-y-1 text-sm break-words">{children}</ul>;
                                            },
                                            ol({ children }) {
                                                return <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm break-words">{children}</ol>;
                                            },
                                            li({ children }) {
                                                return <li className="mb-1 text-sm break-words">{children}</li>;
                                            },
                                            h1({ children }) {
                                                return <h1 className="text-lg font-semibold mb-2 mt-3 break-words">{children}</h1>;
                                            },
                                            h2({ children }) {
                                                return <h2 className="text-base font-semibold mb-2 mt-3 break-words">{children}</h2>;
                                            },
                                            h3({ children }) {
                                                return <h3 className="text-sm font-semibold mb-2 mt-3 break-words">{children}</h3>;
                                            },
                                            blockquote({ children }) {
                                                return <blockquote className="border-l-2 border-muted pl-4 italic my-2 break-words">{children}</blockquote>;
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
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
                            <div className="relative p-3 overflow-hidden">
                                <ReactMarkdown
                                    className="prose prose-xs dark:prose-invert max-w-none break-words text-sm"
                                    components={{
                                        p({ children }) {
                                            return <p className="mb-2 last:mb-0 text-sm whitespace-pre-wrap break-words">{children}</p>;
                                        },
                                        code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
                                            const match = /language-(\w+)/.exec(className || "");
                                            const isInline = !match;
                                            if (isInline) {
                                                return (
                                                    <code className="bg-card/30 rounded px-1 text-xs whitespace-pre-wrap break-all" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                            return (
                                                <div className="relative my-3">
                                                    <code className="block bg-card/30 p-3 rounded-lg text-xs whitespace-pre-wrap break-all overflow-x-auto" {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            );
                                        },
                                        ul({ children }) {
                                            return <ul className="list-disc pl-4 mb-2 space-y-1 text-sm break-words">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm break-words">{children}</ol>;
                                        },
                                        li({ children }) {
                                            return <li className="mb-1 text-sm break-words">{children}</li>;
                                        },
                                        h1({ children }) {
                                            return <h1 className="text-lg font-semibold mb-2 mt-3 break-words">{children}</h1>;
                                        },
                                        h2({ children }) {
                                            return <h2 className="text-base font-semibold mb-2 mt-3 break-words">{children}</h2>;
                                        },
                                        h3({ children }) {
                                            return <h3 className="text-sm font-semibold mb-2 mt-3 break-words">{children}</h3>;
                                        },
                                        blockquote({ children }) {
                                            return <blockquote className="border-l-2 border-muted pl-4 italic my-2 break-words">{children}</blockquote>;
                                        }
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
