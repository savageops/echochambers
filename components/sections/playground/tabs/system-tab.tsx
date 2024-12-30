"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/config-utils";

interface SystemTabProps {
    systemPrompt?: string;
    onSystemPromptChange?: (prompt: string) => void;
}

export function SystemTab({ systemPrompt: externalPrompt = DEFAULT_SYSTEM_PROMPT, onSystemPromptChange }: SystemTabProps) {
    const [prompt, setPrompt] = useLocalStorage(STORAGE_KEYS.SYSTEM_PROMPT, externalPrompt);

    const handleChange = (value: string) => {
        setPrompt(value);
        onSystemPromptChange?.(value);
    };

    return (
        <TabsContent value="system" className="mt-0 h-[400px]">
            <div className="h-full space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">System Prompt</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                        Required
                    </Badge>
                </div>
                <div className="h-[calc(100%-2rem)]">
                    <Textarea
                        value={prompt}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Enter your system prompt here..."
                        className="h-full bg-background/50 resize-none focus:ring-1 focus:ring-primary p-3 font-mono text-sm"
                    />
                </div>
            </div>
        </TabsContent>
    );
}
