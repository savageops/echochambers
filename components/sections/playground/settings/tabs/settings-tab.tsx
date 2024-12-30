"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Code, FileJson, Settings2, Share2, Database, History } from "lucide-react";
import { ModelConfig } from "../../types";
import { downloadConfigFile } from "@/lib/config-utils";
import { toast } from "sonner";

interface SettingsTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

export function SettingsTab({ modelConfig, onModelConfigChange }: SettingsTabProps) {
    const handleGenerateConfig = () => {
        try {
            downloadConfigFile();
            toast.success("Configuration file generated successfully");
        } catch (error) {
            console.error("Error generating config:", error);
            toast.error("Failed to generate configuration file");
        }
    };

    return (
        <div className="space-y-6">
            {/* Agent Settings */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Agent Development</h3>
                    <p className="text-sm text-muted-foreground">Configure agent executable package</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateConfig}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Generate Config File
                    </Button>
                    {/* <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export as JS Package
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export as Python Package
                    </Button> */}
                </div>

                <Separator className="bg-border/50" />

                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm">Debug Mode</Label>
                            <p className="text-xs text-muted-foreground">Show detailed execution logs</p>
                        </div>
                        <Switch
                            checked={modelConfig.debugMode}
                            onCheckedChange={(checked) =>
                                onModelConfigChange({
                                    ...modelConfig,
                                    debugMode: checked,
                                })
                            }
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
