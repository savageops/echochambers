"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ModelConfig } from "../../types";

interface AutomationTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

export function AutomationTab({ modelConfig, onModelConfigChange }: AutomationTabProps) {
    return (
        <div className="space-y-4">
            {/* Scheduling */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Automations</Label>
            </div>
            <Card className="p-4 space-y-4 relative">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                    <p className="text-lg font-semibold">Coming Soon</p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Scheduled Runs</Label>
                            <p className="text-sm text-muted-foreground">Automate model runs on a schedule</p>
                        </div>
                        <Switch
                            checked={modelConfig.enableScheduling}
                            onCheckedChange={(checked) =>
                                onModelConfigChange({
                                    ...modelConfig,
                                    enableScheduling: checked,
                                })
                            }
                        />
                    </div>

                    {modelConfig.enableScheduling && (
                        <Card className="p-4 space-y-4 animate-in fade-in-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Schedule Type</Label>
                                    <Select
                                        value={modelConfig.scheduleType || "interval"}
                                        onValueChange={(value) =>
                                            onModelConfigChange({
                                                ...modelConfig,
                                                scheduleType: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="interval">Fixed Interval</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="custom">Custom Cron</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Run Count</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={modelConfig.maxRuns || 1}
                                            onChange={(e) =>
                                                onModelConfigChange({
                                                    ...modelConfig,
                                                    maxRuns: Number(e.target.value),
                                                })
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">runs</span>
                                    </div>
                                </div>
                            </div>

                            {modelConfig.scheduleType === "custom" && (
                                <div className="space-y-2">
                                    <Label className="text-sm">Cron Expression</Label>
                                    <Input
                                        placeholder="* * * * *"
                                        value={modelConfig.cronExpression || ""}
                                        onChange={(e) =>
                                            onModelConfigChange({
                                                ...modelConfig,
                                                cronExpression: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-sm">Retry Strategy</Label>
                                <Select
                                    value={modelConfig.retryStrategy || "exponential"}
                                    onValueChange={(value) =>
                                        onModelConfigChange({
                                            ...modelConfig,
                                            retryStrategy: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Retry</SelectItem>
                                        <SelectItem value="immediate">Immediate</SelectItem>
                                        <SelectItem value="linear">Linear Backoff</SelectItem>
                                        <SelectItem value="exponential">Exponential Backoff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    )}
                </div>

                <Separator className="bg-border/50" />

                {/* Batch Processing */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Batch Processing</Label>
                            <p className="text-sm text-muted-foreground">Process multiple inputs in batch</p>
                        </div>
                        <Switch
                            checked={modelConfig.enableBatch}
                            onCheckedChange={(checked) =>
                                onModelConfigChange({
                                    ...modelConfig,
                                    enableBatch: checked,
                                })
                            }
                        />
                    </div>

                    {modelConfig.enableBatch && (
                        <Card className="p-4 space-y-4 animate-in fade-in-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Batch Size</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={modelConfig.batchSize || 10}
                                            onChange={(e) =>
                                                onModelConfigChange({
                                                    ...modelConfig,
                                                    batchSize: Number(e.target.value),
                                                })
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">items</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Concurrency</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={modelConfig.concurrency || 2}
                                            onChange={(e) =>
                                                onModelConfigChange({
                                                    ...modelConfig,
                                                    concurrency: Number(e.target.value),
                                                })
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">threads</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </Card>
        </div>
    );
}
