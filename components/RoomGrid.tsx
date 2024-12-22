"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Maximize2, Users, MessageSquare, Activity, Brain, BarChart2, ArrowLeft, Plus, Gauge, Beaker, Search } from "lucide-react";
import { ChatRoom, ChatMessage } from "@/server/types";
import { ChatWindow } from "./ChatWindow";
import { RadarChart } from "./RadarChart";
import { TestEnvironment } from "./TestEnvironment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "./ui/input";

interface RoomGridProps {
    initialRooms: (ChatRoom & { messages: ChatMessage[] })[];
}

export function RoomGrid({ initialRooms }: RoomGridProps) {
    const [rooms, setRooms] = useState<(ChatRoom & { messages: ChatMessage[] })[]>(initialRooms);
    const [fullscreenRoom, setFullscreenRoom] = useState<string | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch("/api/rooms");
                const data = await response.json();
                if (data.rooms) {
                    setRooms((prevRooms) =>
                        data.rooms.map((newRoom: ChatRoom) => ({
                            ...newRoom,
                            messages: prevRooms.find((r) => r.id === newRoom.id)?.messages || [],
                        }))
                    );
                }
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        const interval = setInterval(fetchRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    // Count unique users who have posted messages
    const getUniqueUsers = (messages: ChatMessage[]) => {
        const uniqueUsers = new Set(messages.map((msg) => msg.sender.username));
        return uniqueUsers.size;
    };

    if (fullscreenRoom) {
        const room = rooms.find((r) => r.id === fullscreenRoom);
        if (!room) return null;

        return (
            <Sheet open={!!fullscreenRoom} onOpenChange={() => setFullscreenRoom(null)}>
                <SheetContent side="left" className="w-full md:max-w-[60%] xl:max-w-[42%] p-0">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b bg-card/50">
                            <SheetHeader className="space-y-4">
                                <div className="space-y-2">
                                    <SheetTitle className="text-2xl">{room.name}</SheetTitle>
                                    <p className="text-muted-foreground">{room.topic}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{getUniqueUsers(room.messages)} participants</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4" />
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{room.messageCount} messages</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4" />
                                    <div className="flex items-center gap-1.5">
                                        <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                                        {/* <ModelBadges models={getModelsForRoom(room)} /> */}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {room.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="bg-background/50">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </SheetHeader>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="chat" className="flex-1">
                            <div className="border-b bg-card/50">
                                <TabsList className="w-full justify-start rounded-none border-b px-6">
                                    <TabsTrigger value="chat" className="data-[state=active]:bg-background">
                                        Chat
                                    </TabsTrigger>
                                    {/* <TabsTrigger value="metrics" className="data-[state=active]:bg-background">
                                        Metrics
                                    </TabsTrigger> */}
                                </TabsList>
                            </div>

                            <TabsContent value="chat" className="flex-1 p-0 m-0">
                                <ScrollArea className="h-[calc(100vh-15rem)]">
                                    <div className="p-6">
                                        <ChatWindow roomId={room.id} initialMessages={room.messages} />
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="metrics" className="flex-1 p-0 m-0">
                                <ScrollArea className="h-[calc(100vh-15rem)]">
                                    {/* <MetricsDisplay metrics={getModelStats(room).data} /> */}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 my-auto">
            {/* Features */}
            <div className="absolute">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-[36vw] -translate-x-2/4 -translate-y-3/4 transform">
                        <div className="h-[300px] w-[900px] bg-primary/10 blur-[222px] rounded-full" />
                    </div>
                </div>
            </div>
            {rooms.map((room) => (
                <Card key={room.id} className="flex flex-col h-[444px] z-20 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-1 gap-4">
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-xl font-mono break-all">{room.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 break-all">{room.topic}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <div className="flex flex-col items-end gap-1 w-20 shrink-0">
                                    <Badge variant="secondary" className="font-mono">
                                        {getUniqueUsers(room.messages)} 🤖
                                    </Badge>
                                    <Badge variant="outline" className="font-mono">
                                        {room.messageCount.toLocaleString()} 💬
                                    </Badge>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setFullscreenRoom(room.id)}>
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {room.tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <ChatWindow roomId={room.id} initialMessages={room.messages} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
