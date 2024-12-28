"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, User2, Bot, Trash2, MoveUp, MoveDown, Copy } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface FabricateTabProps {
    onConversationChange?: (messages: Message[]) => void;
}

const STORAGE_KEY = "echochambers_fabrications";

export function FabricateTab({ onConversationChange }: FabricateTabProps) {
    const [messages, setMessages] = useState<Message[]>(() => {
        // Load initial state from localStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved fabrications:", e);
                }
            }
        }
        return [];
    });
    const [currentContent, setCurrentContent] = useState("");

    // Save to localStorage whenever messages change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    const addMessage = (role: "user" | "assistant") => {
        if (!currentContent.trim()) return;

        const newMessages = [...messages, { role, content: currentContent.trim() }];
        setMessages(newMessages);
        setCurrentContent("");
        onConversationChange?.(newMessages);
    };

    const removeMessage = (index: number) => {
        const newMessages = messages.filter((_, i) => i !== index);
        setMessages(newMessages);
        onConversationChange?.(newMessages);
    };

    const moveMessage = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === messages.length - 1)
        )
            return;

        const newMessages = [...messages];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        [newMessages[index], newMessages[newIndex]] = [newMessages[newIndex], newMessages[index]];
        setMessages(newMessages);
        onConversationChange?.(newMessages);
    };

    const duplicateMessage = (index: number) => {
        const newMessages = [...messages];
        newMessages.splice(index + 1, 0, { ...messages[index] });
        setMessages(newMessages);
        onConversationChange?.(newMessages);
    };

    return (
        <div className="h-[400px] space-y-4">
            <div className="flex flex-col gap-4 h-full">
                <ScrollArea className="h-full rounded-md px-3">
                    {messages.map((message, index) => (
                        <Card key={index} className="mb-4 p-3 bg-muted/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {message.role === "user" ? (
                                        <User2 className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                    <Label className="text-sm font-medium">
                                        {message.role === "user" ? "User" : "Assistant"}
                                    </Label>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveMessage(index, "up")}
                                        disabled={index === 0}
                                    >
                                        <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveMessage(index, "down")}
                                        disabled={index === messages.length - 1}
                                    >
                                        <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => duplicateMessage(index)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeMessage(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Separator className="my-2" />
                            <div className="pl-6 whitespace-pre-wrap">{message.content}</div>
                        </Card>
                    ))}
                </ScrollArea>

                <div className="space-y-4">
                    <Textarea
                        value={currentContent}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        placeholder="Type your message here..."
                        className="min-h-[100px]"
                    />
                    <div className="flex flex-col md:flex-row gap-2">
                        <Button
                            onClick={() => addMessage("user")}
                            className="flex-1"
                            disabled={!currentContent.trim()}
                        >
                            <User2 className="h-4 w-4 mr-2" />
                            Add User Message
                        </Button>
                        <Button
                            onClick={() => addMessage("assistant")}
                            className="flex-1"
                            disabled={!currentContent.trim()}
                        >
                            <Bot className="h-4 w-4 mr-2" />
                            Add Assistant Message
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
