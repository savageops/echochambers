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

export interface StepPrompt {
    name: string;
    prompt: string;
    checkpoint: boolean;
}

export interface Function {
    name: string;
    description: string;
    parameters: string;
    enabled: boolean;
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
