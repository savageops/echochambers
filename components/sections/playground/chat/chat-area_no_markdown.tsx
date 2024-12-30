"use client";

import { Message } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

interface ChatAreaProps {
    messages: Message[];
    userInput: string;
    isLoading: boolean;
    processingStep?: {
        number: number;
        name: string;
    };
    onUserInputChange: (input: string) => void;
    onSend: () => void;
    clearChat: () => void;
}

export function ChatArea({ messages, userInput, isLoading, processingStep, onUserInputChange, onSend, clearChat }: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        // Scroll when messages length changes or when loading state changes
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages.length, isLoading]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        onSend();
        // Immediate scroll after sending
        requestAnimationFrame(scrollToBottom);
    };

    return (
        <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col h-[600px] rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/20">
                <h2 className="text-lg font-semibold">Simulated Environment</h2>
                {messages.length > 0 && (
                    <button onClick={clearChat} className="h-8 px-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted/50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            <ScrollArea ref={scrollRef} className="flex-1 p-3">
                <div className="space-y-3">
                    {messages.map((message, index) => (
                        <MotionDiv key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[80%] rounded-xl px-3 py-2 shadow-md", message.role === "user" ? "bg-primary/90 backdrop-blur-sm text-primary-foreground" : "bg-muted/90 backdrop-blur-sm")}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{message.content}</p>
                            </div>
                        </MotionDiv>
                    ))}
                    {isLoading && (
                        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-muted/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm font-mono text-muted-foreground">
                                        {processingStep ? (
                                            <>
                                                Processing Step {processingStep.number}: {processingStep.name}...
                                            </>
                                        ) : (
                                            <>Thinking...</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </MotionDiv>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background/20 backdrop-blur-sm">
                <div className="flex gap-3">
                    <Textarea ref={textareaRef} value={userInput} onChange={(e) => onUserInputChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="min-h-[80px] bg-background/50 resize-none focus-visible:ring-1 focus-visible:ring-primary font-mono" />
                    <button 
                        onClick={onSend} 
                        disabled={isLoading || !userInput.trim()} 
                        className={cn(
                            "bg-primary/10 hover:bg-primary shadow-md transition-all duration-200 rounded-md p-2",
                            "h-[42px] w-[42px] flex items-center justify-center",
                            (isLoading || !userInput.trim()) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </MotionDiv>
    );
}
