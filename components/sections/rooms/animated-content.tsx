"use client";

import { motion, usePresence, AnimatePresence } from "framer-motion";
// import { getRooms, getMessages } from "../../../app/actions";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "lucide-react";
import { RoomGrid } from "@/components/RoomGrid";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ChatRoom, ChatMessage, GlobalStats, ModelInfo } from "@/server/types";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface AnimatedContentProps {
    initialRooms: (ChatRoom & { messages?: ChatMessage[] })[];
}

export function AnimatedContent({ initialRooms }: AnimatedContentProps) {
    const [mounted, setMounted] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [rooms, setRooms] = useState<(ChatRoom & { messages: ChatMessage[] })[]>(
        initialRooms.map(room => ({ ...room, messages: room.messages || [] }))
    );
    const [uniqueAgents, setUniqueAgents] = useState(new Set<string>());
    const [uniqueModels, setUniqueModels] = useState(new Set<string>());
    const [roomParticipants, setRoomParticipants] = useState<Record<string, ModelInfo[]>>({});
    const { socket, getGlobalStats, isConnected, joinRoom, leaveRoom, getMessages } = useSocket();

    const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchText.toLowerCase()));

    useEffect(() => {
        setMounted(true);
        setRooms(initialRooms.map(room => ({ ...room, messages: room.messages || [] })));
    }, [initialRooms]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleGlobalStats = (stats: GlobalStats) => {
            setUniqueAgents(new Set(stats.uniqueAgents?.map(a => a.username) || []));
            setUniqueModels(new Set(stats.uniqueModels || []));
            setRoomParticipants(stats.roomParticipants || {});
            setRooms(prevRooms => {
                return prevRooms.map(room => ({
                    ...room,
                    participantCount: stats.roomParticipants[room.id]?.length || 0,
                    messages: room.messages || []
                }));
            });
        };

        socket.on('global:stats', handleGlobalStats);
        socket.emit('global:stats:get');

        return () => {
            socket.off('global:stats', handleGlobalStats);
        };
    }, [socket, isConnected]);

    // Comment out server action initialization
    /*useEffect(() => {
        const initializeRooms = async () => {
            try {
                const rooms = await getRooms();
                setRooms(rooms);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };
        initializeRooms();
    }, []);*/

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="relative overflow-x-hidden">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                    <div className="h-[300px] w-[1000px] bg-primary/5 blur-[100px] rounded-full" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute bottom-0 right-1/4 transform">
                    <div className="h-[250px] w-[600px] bg-secondary/5 blur-[80px] rounded-full" />
                </motion.div>
            </div>

            <main className="container mx-auto py-6 relative">
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col items-center text-center mt-4 mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="group relative overflow-hidden p-4">
                            <div className="absolute inset-0" />
                            <div className="relative">
                                <Badge className="mb-4 inline-flex" variant="outline">
                                    <Sparkles className="mr-2 h-3 w-3" /> Benchmark & Analyze Agents
                                </Badge>
                                <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/60 via-primary/90 to-primary/60 bg-clip-text text-transparent">Environments</h2>
                                <p className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-[600px] mx-auto">Create and manage your model testing environments</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    {[
                        {
                            label: "Total Rooms",
                            value: filteredRooms.length.toString(),
                        },
                        {
                            label: "Total Messages",
                            value: filteredRooms.reduce((acc, room) => acc + room.messageCount, 0).toLocaleString(),
                        },
                        {
                            label: "Unique Agents",
                            value: uniqueAgents.size.toString(),
                        },
                        {
                            label: "Unique Models",
                            value: uniqueModels.size.toString(),
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50 p-4">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative">
                                <p className="text-lg font-bold text-primary mb-1">{stat.value}</p>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="relative w-full md:w-72 mt-8 mb-4 mx-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search environments..."
                        className="pl-8"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </motion.div> */}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <RoomGrid
                        initialRooms={filteredRooms}
                        roomParticipants={roomParticipants}
                    />
                </motion.div>
            </main>
        </div>
    );
}
