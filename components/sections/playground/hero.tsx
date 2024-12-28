"use client";

import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Sparkles, Bot, Cpu, Braces } from "lucide-react";

export function PlaygroundHero() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.section key="hero-section" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }} transition={{ duration: 0.5 }} onAnimationComplete={() => setIsLoaded(true)} className="relative flex py-12 min-h-[50vh] justify-center overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
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
                                    <Sparkles className="mr-2 h-3 w-3" /> Advanced LLM Experimentation
                                </Badge>
                            </motion.div>

                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                                <span className="bg-gradient-to-br from-primary/30 via-primary/90 to-primary/30 bg-clip-text text-transparent">LLM Playground</span>
                                <span className="block text-xl sm:text-2xl md:text-3xl mt-4 text-muted-foreground">Build • Test • Iterate</span>
                            </motion.h1>

                            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mx-auto max-w-[1100px] text-muted-foreground text-lg sm:text-xl mb-10">
                                A comprehensive environment for crafting and testing LLM prompts. Fine-tune parameters, manage system prompts, and analyze responses in real-time.
                            </motion.p>

                            {/* Feature Grid */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
                                {[
                                    {
                                        icon: Bot,
                                        title: "Agent Automation",
                                        description: "Simulate agent behaviors and interactions",
                                    },
                                    {
                                        icon: Cpu,
                                        title: "Step Prompting",
                                        description: "Create guided prompting workflows",
                                    },
                                    {
                                        icon: Braces,
                                        title: "Function Calling",
                                        description: "Test function implementations",
                                    },
                                ].map((feature, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }} className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 p-6 backdrop-blur-sm transition-colors hover:bg-muted/50">
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
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
            {isLoaded && (
                <motion.div
                    key="collapse-button"
                    initial={false}
                    animate={{
                        y: 26,
                        rotate: isCollapsed ? 0 : 180,
                        backgroundColor: isCollapsed ? "hsl(var(--background))" : "transparent",
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute rounded-md left-[47vw] md:left-[49vw] -translate-x-1/2 bottom-3 z-50"
                >
                    <Button size="icon" variant="outline" onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-md transition-shadow h-8 w-8">
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
