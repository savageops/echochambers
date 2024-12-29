"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Key, Globe } from "lucide-react";
import { ModelConfig } from "../../types";
import { useEffect, useRef } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ModelTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

export function ModelTab({ modelConfig, onModelConfigChange }: ModelTabProps) {
    const isInitializedRef = useRef(false);

    // Load saved config from localStorage only once on mount
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        const savedConfig = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                onModelConfigChange({
                    ...modelConfig,
                    ecapiKey: parsedConfig.ecapiKey || "",
                    apiKey: parsedConfig.apiKey || "",
                    baseUrl: parsedConfig.baseUrl || "",
                    model: parsedConfig.model || "",
                });
            } catch (error) {
                console.error("Error parsing saved model config:", error);
            }
        }
    }, []); // Empty dependency array since we only want this to run once on mount

    // Save config to localStorage whenever it changes
    useEffect(() => {
        if (!isInitializedRef.current) return; // Skip saving during initialization

        const configToSave = {
            ecapiKey: modelConfig.ecapiKey,
            apiKey: modelConfig.apiKey,
            baseUrl: modelConfig.baseUrl,
            model: modelConfig.model,
        };

        const currentSaved = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
        if (currentSaved) {
            const currentConfig = JSON.parse(currentSaved);
            if (JSON.stringify(currentConfig) === JSON.stringify(configToSave)) {
                return; // Skip if no changes
            }
        }

        localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(configToSave));
    }, [modelConfig]);

    return (
        <div className="space-y-6">
            {/* EC SDK API Configuration */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">ECSDK API Configuration</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                        Required
                    </Badge>
                </div>
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm">ECSDK API Key</Label>
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder="Enter your ECSDK API key"
                                value={modelConfig.ecapiKey || ""}
                                onChange={(e) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        ecapiKey: e.target.value,
                                    })
                                }
                                className="pr-10"
                            />
                            <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => (window.location.href = "mailto:contact@echochambers.art?subject=Request%20for%20ECSDK%20API%20Key")}>
                        Request Key
                    </Button>
                </Card>
            </div>

            {/* LLM API Configuration */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">LLM API Configuration</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                        Required
                    </Badge>
                </div>
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm">API Key</Label>
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder="Enter your API key"
                                value={modelConfig.apiKey || ""}
                                onChange={(e) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        apiKey: e.target.value,
                                    })
                                }
                                className="pr-10"
                            />
                            <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm">Base URL</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="https://api.openai.com/v1"
                                value={modelConfig.baseUrl || ""}
                                onChange={(e) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        baseUrl: e.target.value,
                                    })
                                }
                                className="pr-10"
                                required
                            />
                            <Globe className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Model Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Model Selection</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                        Required
                    </Badge>
                </div>
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm">Model</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Enter model name (e.g., gpt-4, claude-2)"
                                value={modelConfig.model || ""}
                                onChange={(e) =>
                                    onModelConfigChange({
                                        ...modelConfig,
                                        model: e.target.value,
                                    })
                                }
                                className="font-mono"
                            />
                            <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
