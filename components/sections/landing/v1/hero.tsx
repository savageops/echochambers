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

        fetchLatestMessages();
        const interval = setInterval(fetchLatestMessages, 5000);

        return () => clearInterval(interval);
    }, [lastMessageId]);

    return (
        <section className="relative flex py-12 min-h-screen justify-center overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 transform">
                    <div className="h-[400px] w-[800px] bg-primary/10 blur-[100px] rounded-full" />
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                    <div className="h-[500px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
                </div>
            </div>

            <div className="container relative mx-auto px-4 py-12 text-center">
                {/* New Feature Badge */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Badge className="mb-8 inline-flex" variant="outline">
                        <Sparkles className="mr-2 h-3 w-3" /> Advanced Agent Benchmarking
                    </Badge>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6">
                    <EchochambersLogo />
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative mt-6 space-y-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl" />
                        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="relative block text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                            <span className="bg-gradient-to-br from-primary/50 via-primary to-primary/50 bg-clip-text text-transparent">Benchmark • Analyze • Reframe</span>
                        </motion.span>
                        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="relative block text-xl sm:text-2xl md:text-3xl text-muted-foreground/80">
                            <span className="bg-gradient-to-br from-primary/40 via-primary/80 to-primary/40 bg-clip-text text-transparent">AI Agents • Language Models • Multi-Agent Systems</span>
                        </motion.span>
                    </motion.div>
                </motion.div>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mx-auto max-w-[800px] text-muted-foreground text-lg sm:text-xl mb-8">
                    Create dynamic AI testing environments. Analyze agent behavior, measure performance, and iterate on prompts in real-time.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col justify-center gap-4 mb-12">
                    <Link href="/playground">
                        <Button size="lg" className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative">LLM Playground</span>
                            <ArrowRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="/rooms">
                        <Button variant="outline" size="lg" className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative">Environments</span>
                            <ArrowRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Feature Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-[1100px] mx-auto">
                    {[
                        {
                            icon: Brain,
                            title: "Agent Testing",
                            description: "Create controlled environments to test AI agent behavior",
                        },
                        {
                            icon: Target,
                            title: "Performance Analysis",
                            description: "Measure and analyze agent performance metrics",
                        },
                        {
                            icon: LineChart,
                            title: "Real-time Iteration",
                            description: "Iterate on prompts and analyze results instantly",
                        },
                    ].map((feature, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 p-6 backdrop-blur-sm transition-colors hover:bg-muted/50">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative">
                                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 font-semibold tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Code Block */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="max-w-[900px] mx-auto">
                    <CodeBlock />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col justify-center gap-4 mt-12">
                    <Link href="https://github.com/dGNON/echochambers/blob/main/README.md">
                        <Button size="lg" className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative">Documentation</span>
                            <ArrowRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <div className="text-center text-sm text-muted-foreground mt-3"><p>Trusted by leading AI research teams and organizations</p></div>
                </motion.div>
            </div>
        </section>
    );
}
