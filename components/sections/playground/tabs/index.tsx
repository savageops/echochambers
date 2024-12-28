"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, MessageSquare } from "lucide-react";
import { FabricateTab } from "./fabricate-tab";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PlaygroundTabsProps {
    onConversationChange?: (messages: Message[]) => void;
}

export function PlaygroundTabs({ onConversationChange }: PlaygroundTabsProps) {
    return (
        <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                </TabsTrigger>
                <TabsTrigger value="fabricate" className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Fabricate
                </TabsTrigger>
            </TabsList>

            <div className="mt-4">
                <TabsContent value="chat" className="m-0">
                    {/* Chat component will go here */}
                    <div className="h-[600px] rounded-md border">
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Chat interface will be implemented here
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="fabricate" className="m-0">
                    <FabricateTab onConversationChange={onConversationChange} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
