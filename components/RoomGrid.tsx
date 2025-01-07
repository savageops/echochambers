import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Maximize2, Users, MessageSquare, Activity, Brain, BarChart2, ArrowLeft, Plus, Gauge, Beaker, Search, LayoutGrid, List, Terminal } from "lucide-react";
import { ChatRoom, ChatMessage, ModelInfo, RoomStats } from "@/server/types";
import { ChatWindow } from "./ChatWindow";
import { RadarChart } from "./RadarChart";
import { TestEnvironment } from "./TestEnvironment";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";

interface RoomGridProps {
    initialRooms: ChatRoom[];
    roomParticipants?: Record<string, ModelInfo[]>;
}

interface GlobalStats {
    uniqueAgents: ModelInfo[];
    uniqueModels: string[];
    roomParticipants: Record<string, ModelInfo[]>;
    messageCount: number;
    participantCount: number;
    timestamp: string;
}

export function RoomGrid({ initialRooms, roomParticipants = {} }: RoomGridProps) {
    const [fullscreenRoom, setFullscreenRoom] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showParticipants, setShowParticipants] = useState(false);
    const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { socket, isConnected } = useSocket();
    const [lastUpdate, setLastUpdate] = useState<string>("");

    useEffect(() => {
        if (!socket) return;

        const handleGlobalStats = (stats: GlobalStats) => {
            setGlobalStats(stats);
            setLastUpdate(new Date().toLocaleTimeString());
        };

        const handleRoomUpdate = (room: ChatRoom & { participantCount: number }) => {
            setRooms(prevRooms => 
                prevRooms.map(r => r.id === room.id ? { ...r, participantCount: room.participantCount, messageCount: room.messageCount } : r)
            );
        };

        socket.on('global:stats', handleGlobalStats);
        socket.on('room:update', handleRoomUpdate);

        // Request initial data
        socket.emit('global:stats:get');

        // Request global stats periodically
        const statsInterval = setInterval(() => {
            socket.emit('global:stats:get');
        }, 5000); // Every 5 seconds
        
        return () => {
            socket.off('global:stats', handleGlobalStats);
            socket.off('room:update', handleRoomUpdate);
            clearInterval(statsInterval);
        };
    }, [socket]);

    // Filter rooms based on search term
    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort rooms by message count
    const sortedRooms = [...filteredRooms].sort((a, b) => b.messageCount - a.messageCount);

    if (fullscreenRoom) {
        const room = sortedRooms.find((r) => r.id === fullscreenRoom);
        if (!room) return null;

        return (
            <Dialog open={true} onOpenChange={() => setFullscreenRoom(null)}>
                <DialogContent className="w-full max-w-[90vw] h-[90vh] p-0">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Expanded Room View: {room.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => setFullscreenRoom(null)}>
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Close expanded view</span>
                                </Button>
                                <div>
                                    <h2 className="text-lg font-semibold">{room.name}</h2>
                                    <p className="text-sm text-muted-foreground">{room.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {room.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="relative flex-1 overflow-hidden bg-muted/5 p-3">
                            <ChatWindow room={room} onClose={() => setFullscreenRoom(null)} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">Active Rooms</h2>
                    <p className="text-sm text-muted-foreground">
                        {rooms.length} rooms • {globalStats?.uniqueAgents.length || 0} participants • Last update: {lastUpdate}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[200px]"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    >
                        {viewMode === "grid" ? (
                            <List className="h-4 w-4" />
                        ) : (
                            <LayoutGrid className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowParticipants(true)}
                    >
                        <Users className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {showParticipants && (
                <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
                    <DialogContent className="w-[calc(100%-3rem)] sm:max-w-[444px] rounded-xl bg-background/95 backdrop-blur-sm border-border p-0 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="sr-only">Room Participants</DialogTitle>
                        </DialogHeader>
                        <motion.div className="relative flex flex-col items-start min-w-[300px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {globalStats?.uniqueAgents.map((agent, index) => (
                                        <motion.div
                                            key={`${agent.username}-${index}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium">
                                                        {agent.username.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{agent.username}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {agent.model}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}

            <Tabs defaultValue="rooms">
                <TabsList>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="rooms" className="space-y-4">
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                        {sortedRooms.map((room) => (
                            <Card key={room.id} className={viewMode === "list" ? "flex" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{room.name}</span>
                                        <Button variant="ghost" size="icon" onClick={() => setFullscreenRoom(room.id)}>
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>{room.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {room.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{globalStats?.roomParticipants[room.id]?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{room.messageCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Activity className="h-4 w-4" />
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="participants">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Participants</CardTitle>
                            <CardDescription>
                                {globalStats?.uniqueAgents.length} unique participants across all rooms
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {globalStats?.uniqueAgents.map((agent, index) => (
                                        <motion.div
                                            key={`${agent.username}-${index}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full w-8 h-8 bg-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium">
                                                        {agent.username.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{agent.username}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {agent.model}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="stats">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Message Count</CardTitle>
                                <CardDescription>Total messages across all rooms</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{globalStats?.messageCount || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Participant Count</CardTitle>
                                <CardDescription>Total unique participants</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {globalStats?.uniqueAgents.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Distribution</CardTitle>
                                <CardDescription>Unique models in use</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {globalStats?.uniqueModels.map((model) => (
                                        <Badge key={model} variant="outline">
                                            {model}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}