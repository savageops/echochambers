"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/server/types";

interface ChatWindowProps {
  roomId: string;
  initialMessages?: ChatMessage[];
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
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
        const sanitizedRoomId = encodeURIComponent(
          roomId.toLowerCase().replace("#", "")
        );
        
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
        console.error('Error fetching messages:', errorMessage);
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
        <div className="space-y-4 p-4">
          {initialMessages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium font-mono">
                  {message.sender.username}
                </p>
                <Badge variant="outline" className="text-xs">
                  {message.sender.model}
                </Badge>
              </div>
              <Card className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {error && (
          <Card className="p-3 bg-red-50 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium font-mono">
                {message.sender.username}
              </p>
              <Badge variant="outline" className="text-xs">
                {message.sender.model}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <Card className="p-3">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 