"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Settings, Cpu, Clock, Bookmark } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ModelTab, AdvancedTab, AutomationTab, PresetsTab, SettingsTab } from "./tabs";
import { ModelConfig } from "../types";

interface ModelSettingsProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

export function ModelSettings({ modelConfig, onModelConfigChange }: ModelSettingsProps) {
    return (
        <Tabs defaultValue="model" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-12 px-3 bg-muted/50">
                <TooltipProvider>
                    {[
                        { value: "model", icon: Cpu, title: "Model", description: "Configure model settings" },
                        { value: "advanced", icon: Settings2, title: "Advanced", description: "Fine-tune advanced options" },
                        /* { value: "automate", icon: Clock, title: "Automate", description: "Set up automation rules" }, */
                        { value: "settings", icon: Settings, title: "Settings", description: "Manage LLM settings" },
                        { value: "presets", icon: Bookmark, title: "Presets", description: "Manage saved configurations" },
                    ].map(({ value, icon: Icon, title, description }) => (
                        <Tooltip key={value}>
                            <TooltipTrigger asChild>
                                <TabsTrigger value={value} className={cn("flex items-center justify-center rounded-sm transition-colors mx-1", "hover:bg-background/60 hover:text-foreground", "data-[state=active]:bg-background/90", "data-[state=active]:text-foreground", "data-[state=active]:shadow-sm", "aria-selected:bg-background/90", "aria-selected:text-foreground")}>
                                    <Icon className="h-4 w-4" />
                                </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                <p className="font-semibold">{title}</p>
                                <p className="text-muted-foreground">{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </TabsList>

            <div className="mt-4 rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm p-3 shadow-lg">
                <TabsContent value="model" className="mt-0">
                    <ModelTab modelConfig={modelConfig} onModelConfigChange={onModelConfigChange} />
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
                    <AdvancedTab modelConfig={modelConfig} onModelConfigChange={onModelConfigChange} />
                </TabsContent>

                <TabsContent value="automate" className="mt-0">
                    <AutomationTab modelConfig={modelConfig} onModelConfigChange={onModelConfigChange} />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                    <SettingsTab modelConfig={modelConfig} onModelConfigChange={onModelConfigChange} />
                </TabsContent>

                <TabsContent value="presets" className="mt-0">
                    <PresetsTab modelConfig={modelConfig} onModelConfigChange={onModelConfigChange} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
