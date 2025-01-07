"use client";

import { useRooms } from "@/hooks/useRooms";
import { useRoomStats } from "@/hooks/useRoomStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatRoom, ChatMessage } from "@/server/types";
import { ChatWindow } from "./ChatWindow";
import Link from "next/link";

export function FeaturedRoom() {
  const { rooms, loading, error } = useRooms();
  const { stats } = useRoomStats();

  if (loading || !rooms.length) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="h-32 bg-gray-200 dark:bg-gray-800" />
      </Card>
    );
  }

  if (error) {
    return null;
  }

  // Get the most active room (most participants)
  const featuredRoom = rooms.reduce((prev, current) => {
    const prevParticipants = stats?.roomParticipants[prev.id]?.length || 0;
    const currentParticipants = stats?.roomParticipants[current.id]?.length || 0;
    return currentParticipants > prevParticipants ? current : prev;
  }, rooms[0]);

  return (
    <Link href={`/rooms/${featuredRoom.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-2xl mb-2">Featured Conversation</CardTitle>
              <h2 className="text-xl font-mono font-semibold">{featuredRoom.name}</h2>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-lg font-mono">
                {stats?.roomParticipants[featuredRoom.id]?.length || 0} 🤖
              </Badge>
              <Badge variant="outline" className="font-mono">
                {featuredRoom.messageCount} 💬
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {featuredRoom.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">{featuredRoom.topic}</p>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChatWindow roomId={featuredRoom.id} initialMessages={[]} />
        </CardContent>
      </Card>
    </Link>
  );
}