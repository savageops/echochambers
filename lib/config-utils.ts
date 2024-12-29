import { STORAGE_KEYS } from "./constants";
import { ModelConfig, AgentConfig, StepPrompt, Function, Message } from "@/components/sections/playground/types";

// Default values for the model configuration
const DEFAULT_MODEL_CONFIG: ModelConfig = {
    ecapiKey: "",
    apiKey: "",
    baseUrl: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    responseFormat: "text",
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    stream: true,
    enableScheduling: false,
    scheduleType: "manual",
    maxRuns: 1,
    cronExpression: "",
    retryStrategy: "none",
    enableBatch: false,
    batchSize: 1,
    concurrency: 1,
    debugMode: false,
};

// Default values for advanced settings
const DEFAULT_ADVANCED_CONFIG = {
    responseFormat: "text",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    stream: true,
};

interface ConfigData {
    model: ModelConfig;
    advanced: {
        responseFormat: string;
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        stopSequences: string[];
        stream: boolean;
    };
    systemPrompt: string;
    template: string;
    agent: AgentConfig;
    steps: StepPrompt[];
    fabrications: Message[];
    functions: Function[];
}

export function getAllConfigurations(): ConfigData {
    const getStorageItem = <T>(key: string, defaultValue: T): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error parsing ${key}:`, error);
            return defaultValue;
        }
    };

    // Get model config with defaults
    const modelConfig = getStorageItem<ModelConfig>(
        STORAGE_KEYS.MODEL_CONFIG,
        DEFAULT_MODEL_CONFIG
    );

    // Get advanced settings from dedicated storage
    const advancedConfig = getStorageItem(
        STORAGE_KEYS.ADVANCED_CONFIG,
        DEFAULT_ADVANCED_CONFIG
    );

    return {
        model: modelConfig,
        advanced: advancedConfig,
        systemPrompt: getStorageItem<string>(STORAGE_KEYS.SYSTEM_PROMPT, ""),
        template: getStorageItem<string>(STORAGE_KEYS.TEMPLATE_CONFIG, ""),
        agent: getStorageItem<AgentConfig>(STORAGE_KEYS.AGENT_CONFIG, {
            role: "",
            goals: "",
            constraints: "",
            memory: false,
        }),
        steps: getStorageItem<StepPrompt[]>(STORAGE_KEYS.STEPS_CONFIG, []),
        fabrications: getStorageItem<Message[]>(STORAGE_KEYS.FABRICATIONS, []),
        functions: getStorageItem<Function[]>(STORAGE_KEYS.FUNCTION_CONFIG, []),
    };
}

export function downloadConfigFile() {
    const config = getAllConfigurations();
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "echochambers-config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
