"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { StepPrompt } from "../types";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface StepsTabProps {
    stepPrompts?: StepPrompt[];
    onStepPromptsChange?: (steps: StepPrompt[]) => void;
}

const defaultStep: StepPrompt = {
    name: "",
    prompt: "",
    checkpoint: false,
};

export function StepsTab({ 
    stepPrompts: externalSteps = [], 
    onStepPromptsChange 
}: StepsTabProps) {
    const [steps, setSteps] = useLocalStorage("echochambers_steps", externalSteps);

    const handleStepChange = (index: number, updates: Partial<StepPrompt>) => {
        const newSteps = [...steps];
        newSteps[index] = { 
            ...defaultStep,
            ...newSteps[index], 
            ...updates 
        };
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
    };

    const handleAddStep = () => {
        const newSteps = [
            ...steps,
            {
                ...defaultStep,
                name: `Step ${steps.length + 1}`,
            },
        ];
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
    };

    return (
        <div className="h-[400px] space-y-4">
            <ScrollArea className="h-[87%] rounded-md px-3">
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="space-y-2 p-4 rounded-lg border bg-background/50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Input
                                        value={step.name || ""}
                                        onChange={(e) => handleStepChange(index, { name: e.target.value })}
                                        placeholder="Step Name"
                                        className="max-w-[200px]"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={step.checkpoint}
                                            onCheckedChange={(checked) =>
                                                handleStepChange(index, { checkpoint: checked })
                                            }
                                        />
                                        <Label className="text-sm">Checkpoint</Label>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveStep(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Prompt</Label>
                                <Textarea
                                    value={step.prompt || ""}
                                    onChange={(e) => handleStepChange(index, { prompt: e.target.value })}
                                    placeholder="Enter the prompt for this step..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <Button variant="outline" onClick={handleAddStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
            </Button>
        </div>
    );
}
