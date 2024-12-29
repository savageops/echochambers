import { Message, ModelConfig, StepPrompt } from "@/components/sections/playground/types";
import { STORAGE_KEYS } from "./constants";

interface ChatResponse {
    role: "assistant";
    content: string;
}

interface ProcessingStatus {
    onStepStart?: (stepNumber: number, stepName: string) => void;
    onStepComplete?: (stepNumber: number, stepName: string) => void;
}

async function makeApiRequest(messages: { role: string; content: string }[], modelConfig: any, advancedConfig: any): Promise<ChatResponse> {
    const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${modelConfig.apiKey}`,
        },
        body: JSON.stringify({
            model: modelConfig.model,
            messages,
            temperature: advancedConfig.temperature ?? 0.7,
            max_tokens: advancedConfig.maxTokens ?? 4096,
            top_p: advancedConfig.topP ?? 1.0,
            frequency_penalty: advancedConfig.frequencyPenalty ?? 0.0,
            presence_penalty: advancedConfig.presencePenalty ?? 0.0,
            stop: advancedConfig.stopSequences ?? [],
            stream: advancedConfig.stream ?? false,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get response from the API");
    }

    const data = await response.json();
    return {
        role: "assistant",
        content: data.choices[0].message.content,
    };
}

function buildMessages(userMessage: string, previousResponse?: string): { role: string; content: string }[] {
    const messages = [];

    // Add system prompt if available
    const systemPrompt = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT);
    if (systemPrompt?.trim()) {
        messages.push({
            role: "system",
            content: systemPrompt.trim(),
        });
    }

    // Add template configuration if available
    const templateConfig = localStorage.getItem(STORAGE_KEYS.TEMPLATE_CONFIG);
    if (templateConfig?.trim()) {
        messages.push({
            role: "user",
            content: `Template:\n${templateConfig.trim()}`,
        });
    }

    // Add agent configuration if available
    const agentConfig = localStorage.getItem(STORAGE_KEYS.AGENT_CONFIG);
    if (agentConfig) {
        try {
            const parsedAgent = JSON.parse(agentConfig);
            if (parsedAgent && Object.keys(parsedAgent).length > 0) {
                const agentPrompt = ["Agent Configuration:", `Role: ${parsedAgent.role || "Not specified"}`, `Goals: ${parsedAgent.goals || "Not specified"}`, `Constraints: ${parsedAgent.constraints || "Not specified"}`, `Memory Enabled: ${parsedAgent.memory ? "Yes" : "No"}`].join("\n");

                if (agentPrompt.trim()) {
                    messages.push({
                        role: "user",
                        content: agentPrompt.trim(),
                    });
                }
            }
        } catch (error) {
            console.error("Failed to parse agent configuration:", error);
        }
    }

    // Add fabricated messages if available
    const fabricatedMessages = localStorage.getItem(STORAGE_KEYS.FABRICATIONS);
    if (fabricatedMessages) {
        try {
            const parsedMessages = JSON.parse(fabricatedMessages) as Message[];
            if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                parsedMessages.forEach((msg) => {
                    messages.push({
                        role: msg.role,
                        content: msg.content.trim(),
                    });
                });
            }
        } catch (error) {
            console.error("Failed to parse fabricated messages:", error);
        }
    }

    // Add chat history from localStorage
    const chatHistory = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (chatHistory) {
        try {
            const parsedHistory = JSON.parse(chatHistory) as Message[];
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                parsedHistory.forEach((msg) => {
                    // Only include chat messages, not system or other types
                    if (msg.type === "chat") {
                        messages.push({
                            role: msg.role,
                            content: msg.content.trim(),
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Failed to parse chat history:", error);
        }
    }

    // Add previous response if provided
    if (previousResponse) {
        messages.push({
            role: "assistant",
            content: previousResponse,
        });
    }

    // Add current user message
    messages.push({
        role: "user",
        content: userMessage,
    });

    return messages;
}

async function processSteps(initialUserMessage: string, initialResponse: ChatResponse, modelConfig: any, advancedConfig: any, status: ProcessingStatus): Promise<ChatResponse> {
    let currentResponse = initialResponse;

    // Get steps configuration
    const stepsConfig = localStorage.getItem(STORAGE_KEYS.STEPS_CONFIG);
    if (!stepsConfig) {
        return currentResponse;
    }

    try {
        const steps = JSON.parse(stepsConfig) as StepPrompt[];
        if (!Array.isArray(steps) || steps.length === 0) {
            return currentResponse;
        }

        // Process each step sequentially
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepNumber = i + 1;

            // Notify step start
            status.onStepStart?.(stepNumber, step.name);

            // Build messages for this step
            const stepMessages = buildMessages(step.prompt, currentResponse.content);

            // Make API request for this step
            currentResponse = await makeApiRequest(stepMessages, modelConfig, advancedConfig);

            // Notify step complete
            status.onStepComplete?.(stepNumber, step.name);

            // If this step requires a checkpoint, store the user input and response
            if (step.checkpoint) {
                const checkpointData = {
                    stepNumber,
                    stepName: step.name,
                    userInput: initialUserMessage,
                    response: currentResponse.content,
                };

                // Store checkpoint data in localStorage
                const existingCheckpoints = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKPOINTS) || "[]");
                existingCheckpoints.push(checkpointData);
                localStorage.setItem(STORAGE_KEYS.CHECKPOINTS, JSON.stringify(existingCheckpoints));

                // If there's a next step, add the checkpoint data to its prompt
                if (i < steps.length - 1) {
                    steps[i + 1].prompt = `**The following is a summary of important context from previous steps to be used with the USER. **
{{ CHECKPOINT ${stepNumber} }}

USER Intent:
${checkpointData.userInput}

Assistant Response:
${checkpointData.response}

**Note: this summary checkpoint from the last Step is just for your reference**

${steps[i + 1].prompt}`;
                }
            }
        }
    } catch (error) {
        console.error("Error processing steps:", error);
        throw error;
    }

    return currentResponse;
}

export async function sendChatMessage(message: string, status: ProcessingStatus = {}): Promise<ChatResponse> {
    try {
        // Load configurations from localStorage
        const modelConfigStr = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
        const advancedConfigStr = localStorage.getItem(STORAGE_KEYS.ADVANCED_CONFIG);

        if (!modelConfigStr) {
            throw new Error("Model configuration not found");
        }

        const modelConfig = JSON.parse(modelConfigStr);
        const advancedConfig = advancedConfigStr ? JSON.parse(advancedConfigStr) : {};

        // Validate required configuration
        if (!modelConfig.apiKey || !modelConfig.baseUrl || !modelConfig.model) {
            throw new Error("Missing required model configuration");
        }

        // Initial API request
        const messages = buildMessages(message);

        let response = await makeApiRequest(messages, modelConfig, advancedConfig);

        // Process through steps if any exist
        response = await processSteps(message, response, modelConfig, advancedConfig, status);

        return response;
    } catch (error) {
        console.error("Error in chat service:", error);
        throw error;
    }
}
