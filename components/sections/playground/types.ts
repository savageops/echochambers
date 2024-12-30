export interface Message {
    role: "user" | "assistant";
    content: string;
    type?: "chat" | "fabricated";
}

export interface ModelConfig {
    ecapiKey: string;
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    responseFormat: string;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
    stream: boolean;
    enableScheduling: boolean;
    scheduleType: string;
    maxRuns: number;
    cronExpression: string;
    retryStrategy: string;
    enableBatch: boolean;
    batchSize: number;
    concurrency: number;
    debugMode: boolean;
}

export interface AgentConfig {
    role: string;
    goals: string;
    constraints: string;
    memory: boolean;
}

export interface StepParams {
    model?: string;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    maxTokens?: number;
    stopSequences?: string[];
}

export interface StepPrompt {
    name: string;
    prompt: string;
    checkpoint: boolean;
    customParams: boolean;
    params?: StepParams;
}

export interface Function {
    name: string;
    description: string;
    enabled: boolean;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    beta?: boolean;
    parameters?: string;
}

export interface WorkspaceState {
    messages: Message[];
    chatMessages: Message[];
    systemPrompt: string;
    userInput: string;
    isLoading: boolean;
    modelConfig: ModelConfig;
    availableFunctions: Function[];
    promptTemplate: string;
    agentConfig: AgentConfig;
    stepPrompts: StepPrompt[];
}
