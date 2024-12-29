"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { AgentConfig } from "../types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STORAGE_KEYS } from "@/lib/constants";

interface AgentTabProps {
    agentConfig?: AgentConfig;
    onAgentConfigChange?: (config: AgentConfig) => void;
}

const defaultAgentConfig: AgentConfig = {
    role: "",
    goals: "",
    constraints: "",
    memory: true,
};

export function AgentTab({ agentConfig: externalConfig = defaultAgentConfig, onAgentConfigChange }: AgentTabProps) {
    const [config, setConfig] = useLocalStorage(STORAGE_KEYS.AGENT_CONFIG, externalConfig);

    const handleChange = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onAgentConfigChange?.(newConfig);
    };

    return (
        <div className="h-[400px] rounded-md">
            <ScrollArea className="h-full px-2">
                <TabsContent value="agent" className="m-1">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Agent Role</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Required
                                </Badge>
                            </div>
                            <Input value={config.role} onChange={(e) => handleChange("role", e.target.value)} placeholder="Define the agent's role..." className="bg-background/50" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Goals</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Required
                                </Badge>
                            </div>
                            <Textarea value={config.goals} onChange={(e) => handleChange("goals", e.target.value)} placeholder="Define the agent's goals..." className="min-h-[100px] bg-background/50 resize-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Constraints</Label>
                                <Badge variant="outline" className="font-mono text-xs">
                                    Optional
                                </Badge>
                            </div>
                            <Textarea value={config.constraints} onChange={(e) => handleChange("constraints", e.target.value)} placeholder="Define any constraints..." className="min-h-[100px] bg-background/50 resize-none focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Memory</Label>
                                <div className="text-sm text-muted-foreground">Enable memory for contextual awareness</div>
                            </div>
                            <Switch checked={config.memory} onCheckedChange={(checked) => handleChange("memory", checked)} />
                        </div>
                    </div>
                </TabsContent>
            </ScrollArea>
        </div>
    );
}
