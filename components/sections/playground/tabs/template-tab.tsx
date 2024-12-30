"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_TEMPLATE } from "@/lib/config-utils";

interface TemplateTabProps {
    promptTemplate?: string;
    onPromptTemplateChange?: (template: string) => void;
}

export function TemplateTab({ promptTemplate: externalTemplate = DEFAULT_TEMPLATE, onPromptTemplateChange }: TemplateTabProps) {
    const [template, setTemplate] = useLocalStorage(STORAGE_KEYS.TEMPLATE_CONFIG, externalTemplate);

    const handleChange = (value: string) => {
        setTemplate(value);
        onPromptTemplateChange?.(value);
    };

    return (
        <TabsContent value="template" className="mt-0 h-[400px]">
            <div className="h-full space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Prompt Template</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                        Optional
                    </Badge>
                </div>
                <div className="h-[calc(100%-2rem)]">
                    <Textarea
                        value={template}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={`Given the following {{data_type}}:
{{data}}

Analyze and provide insights on:
1. {{aspect_1}}
2. {{aspect_2}}
3. {{aspect_3}}

Consider {{context}} in your analysis.`}
                        className="h-full bg-background/50 resize-none focus:ring-1 focus:ring-primary p-3 font-mono text-sm"
                    />
                </div>
            </div>
        </TabsContent>
    );
}
