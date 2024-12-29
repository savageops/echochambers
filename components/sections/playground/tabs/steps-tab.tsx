"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ChevronUp, ChevronDown, ChevronRight, ChevronDown as Expand } from "lucide-react";
import { StepPrompt } from "../types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StepsTabProps {
    stepPrompts?: StepPrompt[];
    onStepPromptsChange?: (steps: StepPrompt[]) => void;
}

const defaultStep: StepPrompt = {
    name: "",
    prompt: "",
    checkpoint: false,
};

export function StepsTab({ stepPrompts: externalSteps = [], onStepPromptsChange }: StepsTabProps) {
    const [steps, setSteps] = useLocalStorage(STORAGE_KEYS.STEPS_CONFIG, externalSteps);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    const handleStepChange = (index: number, updates: Partial<StepPrompt>) => {
        const newSteps = steps.map((step, i) => (i === index ? { ...defaultStep, ...step, ...updates } : step));
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
    };

    const handleAddStep = () => {
        const newSteps = [...steps, { ...defaultStep, name: `` }];
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
        setExpandedStep(newSteps.length - 1);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
        if (expandedStep === index) setExpandedStep(null);
    };

    const handleMoveStep = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= steps.length) return;
        const newSteps = [...steps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        setSteps(newSteps);
        onStepPromptsChange?.(newSteps);
        setExpandedStep(newIndex);
    };

    return (
        <div className="h-[400px] space-y-4">
            <ScrollArea className="h-[87%] rounded-md px-3">
                <AnimatePresence>
                    {steps.map((step, index) => (
                        <div key={index} className="mb-4">
                            <div className="p-3 rounded-lg border bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 w-full">
                                        <Button variant="ghost" size="sm" onClick={() => setExpandedStep(expandedStep === index ? null : index)}>
                                            {expandedStep === index ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                        <Input value={step.name || ""} onChange={(e) => handleStepChange(index, { name: e.target.value })} placeholder="Step Name" className="flex-grow text-sm font-semibold" />
                                        <Button className="bg-transparent border-none" variant="outline" size="sm" onClick={() => handleRemoveStep(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveStep(index, "up")} disabled={index === 0}>
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveStep(index, "down")} disabled={index === steps.length - 1}>
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Label className="text-xs sm:text-sm">Checkpoint</Label>
                                            <Switch checked={step.checkpoint} onCheckedChange={(checked) => handleStepChange(index, { checkpoint: checked })} />
                                        </div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedStep === index && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 mt-3">
                                            <Textarea value={step.prompt || ""} onChange={(e) => handleStepChange(index, { prompt: e.target.value })} placeholder="Enter the prompt for this step..." className="text-sm min-h-[50px] resize-y w-full" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </ScrollArea>
            <Button variant="outline" onClick={handleAddStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
            </Button>
        </div>
    );
}
