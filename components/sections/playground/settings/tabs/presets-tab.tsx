"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, Download, History } from "lucide-react";
import { ModelConfig } from "../../types";

interface PresetsTabProps {
    modelConfig: ModelConfig;
    onModelConfigChange: (config: ModelConfig) => void;
}

const presets = [
    {
        name: "Creative",
        description: "Optimized for creative and diverse outputs",
        config: {
            temperature: 1.0,
            topP: 0.95,
            frequencyPenalty: 0.7,
            presencePenalty: 0.7,
        },
    },
    {
        name: "Technical",
        description: "Precise and consistent technical content",
        config: {
            temperature: 0.2,
            topP: 0.1,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
        },
    },
    {
        name: "Balanced",
        description: "General purpose configuration for any task",
        config: {
            temperature: 0.7,
            topP: 0.7,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
        },
    },
    {
        name: "Code",
        description: "Optimized for generating code and programming",
        config: {
            temperature: 0.1,
            topP: 0.1,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0,
        },
    },
    {
        name: "Storytelling",
        description: "Ideal for narrative scripting and plot development",
        config: {
            temperature: 0.9,
            topP: 0.9,
            frequencyPenalty: 0.5,
            presencePenalty: 0.5,
        },
    },
    {
        name: "Character",
        description: "Focused on developing unique personalities",
        config: {
            temperature: 1.1,
            topP: 0.95,
            frequencyPenalty: 0.6,
            presencePenalty: 0.6,
        },
    },
    {
        name: "Academic",
        description: "Suited for scholar/research-oriented content",
        config: {
            temperature: 0.3,
            topP: 0.2,
            frequencyPenalty: 0.2,
            presencePenalty: 0.2,
        },
    },
    {
        name: "Poetic",
        description: "Optimized for lyrical/metaphorical language",
        config: {
            temperature: 1.2,
            topP: 0.98,
            frequencyPenalty: 0.8,
            presencePenalty: 0.8,
        },
    },
];

export function PresetsTab({ modelConfig, onModelConfigChange }: PresetsTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset, index) => (
                    <motion.div
                        key={preset.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                            onModelConfigChange({
                                ...modelConfig,
                                ...preset.config,
                            })
                        }
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative space-y-1">
                            <h3 className="font-medium">{preset.name}</h3>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
