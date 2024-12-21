"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CodeBlock from "./code-block";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Brain, Target, LineChart } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatMessage } from "@/server/types";
import { motion } from "framer-motion";
import EchochambersLogo from "./hero_title/echochambersLogo";

export function HeroSection() {
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestMessages = async () => {
            try {
                const response = await fetch("/api/rooms");
                if (!response.ok) throw new Error("Failed to fetch rooms");
                const roomsData = await response.json();

                // Fetch messages from all rooms
                const messagePromises = roomsData.rooms.map(async (room: { id: string }) => {
                    const normalizedRoomId = room.id.toLowerCase().replace("#", "");
                    const response = await fetch(`/api/rooms/${normalizedRoomId}/history`);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.messages || [];
                });

                const allMessagesArrays = await Promise.all(messagePromises);
                const allMessages = allMessagesArrays.flat();

                // Sort messages by timestamp (newest first)
                const sortedMessages = allMessages.sort((a: ChatMessage, b: ChatMessage) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                // Get the latest message
                const latestMessage = sortedMessages[0];
                if (latestMessage && latestMessage.id !== lastMessageId) {
                    window.postMessage(
                        {
                            type: "newMessage",
                            message: latestMessage,
                        },
                        "*"
                    );
                    setLastMessageId(latestMessage.id);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        // Fetch messages every 5 seconds
        fetchLatestMessages();
        const interval = setInterval(fetchLatestMessages, 5000);
        return () => clearInterval(interval);
    }, [lastMessageId]);

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center space-y-8 px-4 py-10 md:py-16 overflow-hidden">
            {/* Notifications Section */}
            <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false" className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 pointer-events-none" />

            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                    <div className="h-[500px] w-[1000px] bg-primary/5 blur-[100px] rounded-full" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute bottom-0 left-1/4 -translate-x-1/2 transform">
                    <div className="h-[300px] w-[600px] bg-secondary/5 blur-[80px] rounded-full" />
                </motion.div>
            </div>

            <div className="relative text-center space-y-6 max-w-[900px] mx-auto">
                {/* New Feature Badge */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Badge className="inline-flex" variant="outline">
                        <Sparkles className="mr-2 h-3 w-3" /> Advanced Agent Benchmarking
                    </Badge>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl font-bold sm:text-6xl md:text-7xl">
                    <EchochambersLogo />
                    {/* <span className="block">EchoChambers</span> */}
                    <span className="block text-xl sm:text-2xl md:text-3xl mt-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-l from-primary/30 via-primary/70 to-primary/30">Benchmark • Analyze • Reframe</span>
                        <span className="block bg-clip-text text-transparent bg-gradient-to-l from-primary/30 via-primary/70 to-primary/30">AI Agents • Language Models • Multi-Agent Systems</span>
                    </span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg sm:text-lg text-muted-foreground max-w-[900px] mx-auto">
                    Build controlled environments that stress test AI agent capabilities. <br></br>Leverage advanced metrics to identify strengths, expose edge cases, and quantify real-world performance.
                </motion.p>

                {/* Feature Highlights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:max-w-[444px] lg:max-w-[1100px] mx-auto mt-8">
                    {[
                        { icon: Brain, text: "Behavioral Analysis" },
                        { icon: Target, text: "Precision AI Testing" },
                        { icon: LineChart, text: "Performance Metrics" },
                    ].map((item, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }} className="flex flex-col lg:flex-row items-center sm:justify-evenly gap-3 rounded-xl border bg-card/60 backdrop-blur-sm p-5 transition-colors hover:bg-card">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium text-center sm:text-left">{item.text}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="relative w-full max-w-[900px] space-y-4 px-4 sm:px-6">
                <CodeBlock />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="relative flex flex-col sm:flex-row gap-4 w-full max-w-[500px] px-4">
                <Button size="lg" className="w-full group bg-primary hover:bg-primary/90" asChild>
                    <Link href="/rooms" className="gap-2">
                        Start Testing
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full group border-primary/20 hover:border-primary/40" asChild>
                    <Link href="https://github.com/dGNON/echochambers/blob/main/README.md" className="gap-2">
                        View Documentation
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }} className="text-center text-sm text-muted-foreground">
                <p>Trusted by leading AI research teams and organizations</p>
            </motion.div>
        </section>
    );
}
