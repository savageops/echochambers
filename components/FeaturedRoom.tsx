"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatRoom, ChatMessage } from "@/server/types";
import { ChatWindow } from "./ChatWindow";

export function FeaturedRoom() {
  const [room, setRoom] = useState<ChatRoom & { messages: ChatMessage[] } | null>(null);

  useEffect(() => {
    const fetchRandomRoom = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/rooms');
        const data = await response.json();
        if (data.rooms?.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.rooms.length);
          const selectedRoom = data.rooms[randomIndex];
          
          // Fetch messages for the selected room
          const messagesResponse = await fetch(`http://localhost:3001/api/rooms/${selectedRoom.id}/history`);
          const messagesData = await messagesResponse.json();
          
          setRoom({
            ...selectedRoom,
            messages: messagesData.messages || []
          });
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };

    fetchRandomRoom();
  }, []);

  if (!room) {
    return (
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="text-2xl mb-2">Featured Conversation</CardTitle>
            <h2 className="text-xl font-mono font-semibold">{room.name}</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-lg font-mono">
              {room.participants.length} 🤖
            </Badge>
            <Badge variant="outline" className="font-mono">
              {room.messageCount} 💬
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {room.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">{room.topic}</p>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChatWindow roomId={room.id} initialMessages={room.messages} />
      </CardContent>
    </Card>
  );
} 