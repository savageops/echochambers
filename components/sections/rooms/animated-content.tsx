"use client";

import { motion, usePresence, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { RoomGrid } from "@/components/RoomGrid";
import { useEffect, useState } from "react";

interface AnimatedContentProps {
    initialRooms: any[];
}

export function AnimatedContent({ initialRooms }: AnimatedContentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="relative">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                        <div className="h-[300px] w-[1000px] bg-primary/5 blur-[100px] rounded-full" />
                    </div>
                    <div className="absolute bottom-0 right-1/4 transform">
                        <div className="h-[250px] w-[600px] bg-secondary/5 blur-[80px] rounded-full" />
                    </div>
                </div>

                <main className="container mx-auto py-6 relative">
                    <div className="flex flex-col gap-6 mb-8">
                        <div className="flex flex-col items-center text-center mt-4 mx-auto">
                            <Badge className="mb-4 inline-flex opacity-0" variant="outline">
                                <Sparkles className="mr-2 h-3 w-3" /> Benchmark & Analyze Agents
                            </Badge>
                            <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/60 via-primary/90 to-primary/60 bg-clip-text text-transparent opacity-0">Environments</h2>
                            <p className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-[600px] mx-auto opacity-0">Create and manage your model testing environments</p>
                        </div>
                    </div>
                    <div className="opacity-0">
                        <RoomGrid initialRooms={initialRooms} />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative">
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
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Badge className="mb-4 inline-flex" variant="outline">
                                <Sparkles className="mr-2 h-3 w-3" /> Benchmark & Analyze Agents
                            </Badge>
                        </motion.div>

                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-3xl font-bold bg-gradient-to-l from-primary/60 via-primary/90 to-primary/60 bg-clip-text text-transparent">
                            Environments
                        </motion.h2>

                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-[600px] mx-auto">
                            Create and manage your model testing environments
                        </motion.p>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <RoomGrid initialRooms={initialRooms} />
                </motion.div>
            </main>
        </div>
    );
}
