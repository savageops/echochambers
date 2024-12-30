export const serverTemplate = `import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cron from "node-cron";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = JSON.parse(readFileSync(join(__dirname, "echochambers-config.json"), "utf8"));

// Configuration variables
const API_KEY = config.model.apiKey;
const EC_API_KEY = config.model.ecapiKey;
const USER_NAME = config.package.botName;
const ROOM_API_URL = config.package.roomURL;
const ROOM_NAME = config.package.roomName;

// Configuration settings
const CRON_SCHEDULE = config.package.cronSchedule;
const HISTORY_LIMIT = config.package.historyLimit; // Number of recent messages to process

// Store conversation history
let conversationHistory = [];
let processedMessageIds = new Set(); // Track processed message IDs

// Initialize conversation with config and history
async function initializeConversation() {
    conversationHistory = [];

    // Add system prompt
    if (config.systemPrompt) {
        conversationHistory.push({ role: "system", content: config.systemPrompt });
    }

    // Add template data if present
    if (config.template) {
        conversationHistory.push({ role: "user", content: config.template });
    }

    // Add agent role and goals if present
    if (config.agent && config.agent.role) {
        conversationHistory.push({
            role: "user",
            content: \`Role: \${config.agent.role}\\nGoals: \${config.agent.goals}\\nConstraints: \${config.agent.constraints}\`,
        });
    }

    // Add fabricated messages
    if (config.fabrications && Array.isArray(config.fabrications)) {
        conversationHistory.push(...config.fabrications);
    }

    // Get and add room history
    try {
        const history = await getRoomHistory();
        addMessageContext(history);
    } catch (error) {
        console.error("Error initializing conversation with history:", error);
    }
}

// Get room message history
async function getRoomHistory() {
    try {
        const response = await fetch(\`\${ROOM_API_URL}/\${ROOM_NAME}/history\`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": EC_API_KEY,
            },
        });

        const data = await response.json();

        // Ensure we have an array of messages
        const messages = Array.isArray(data) ? data : data.messages || [];

        if (messages.length === 0) {
            console.log("No messages in history");
            return [];
        }

        return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, HISTORY_LIMIT);
    } catch (error) {
        console.error("Error fetching room history:", error);
        return []; // Return empty array on error
    }
}

// Add message context to conversation
function addMessageContext(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        console.log("No messages to process");
        return null;
    }

    // Filter messages not from our bot and sort by timestamp
    const nonBotMessages = messages
        .filter((msg) => msg && msg.sender && msg.sender.username !== USER_NAME && msg.id && msg.timestamp && msg.content)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, HISTORY_LIMIT);

    if (nonBotMessages.length === 0) {
        console.log("No valid non-bot messages found");
        return null;
    }

    // Filter out messages we haven't stored yet
    const newMessages = nonBotMessages.filter((msg) => !processedMessageIds.has(msg.id));

    if (newMessages.length > 0) {
        // Add new message IDs to our processed set
        newMessages.forEach((msg) => processedMessageIds.add(msg.id));

        // Add each message to conversation history in chronological order
        newMessages
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .forEach((msg) => {
                conversationHistory.push({
                    role: "user",
                    content: msg.content,
                    timestamp: msg.timestamp,
                    id: msg.id,
                });
            });
    }

    // Return the most recent valid message
    return nonBotMessages[0];
}

// Construct messages array for API request
function constructMessages(latestMessage) {
    // Start with system prompt and configuration
    const messages = [];

    if (config.systemPrompt) {
        messages.push({
            role: "system",
            content: \`\${config.systemPrompt}\\nIMPORTANT: Always provide concise, focused responses.\`,
        });
    }

    // Add template data if present
    if (config.template) {
        messages.push({ role: "user", content: config.template });
    }

    // Add agent role and goals if present
    if (config.agent && config.agent.role) {
        messages.push({
            role: "user",
            content: \`Role: \${config.agent.role}\\nGoals: \${config.agent.goals}\\nConstraints: \${config.agent.constraints}\`,
        });
    }

    // Add conversation history (last 30 exchanges)
    const recentHistory = conversationHistory
        .slice(-30) // Get last 30 messages (15 exchanges)
        .map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

    messages.push(...recentHistory);

    // Add the latest message to respond to
    messages.push({
        role: "user",
        content: \`Respond to this message: \${latestMessage}\\nRemember to be concise and focused in your response.\`,
    });

    return messages;
}

// Process response through steps if configured
async function processSteps(initialUserMessage, initialResponse) {
    let currentResponse = initialResponse;

    // Get steps from config
    if (!config.steps || !Array.isArray(config.steps) || config.steps.length === 0) {
        return currentResponse;
    }

    try {
        // Process each step sequentially
        for (let i = 0; i < config.steps.length; i++) {
            const step = config.steps[i];
            const stepNumber = i + 1;

            console.log(\`Processing step \${stepNumber}: \${step.name}\`);

            // Construct messages for this step
            const messages = [];

            // Add system prompt and configuration
            if (config.systemPrompt) {
                messages.push({
                    role: "system",
                    content: \`\${config.systemPrompt}\\nIMPORTANT: Always provide concise, focused responses.\`,
                });
            }

            // Add step-specific prompt with current response
            messages.push({
                role: "user",
                content: \`\${step.prompt}\\n\\nPrevious response: \${currentResponse}\`,
            });

            // Make API request for this step
            const response = await fetch(\`\${config.model.baseUrl}/chat/completions\`, {
                method: "POST",
                headers: {
                    Authorization: \`Bearer \${API_KEY}\`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: config.steps[i].customParams ? config.steps[i].params.model : config.model.model,
                    messages: messages,
                    temperature: config.steps[i].customParams ? config.steps[i].params.temperature : config.advanced.temperature,
                    top_p: config.steps[i].customParams ? config.steps[i].params.topP : config.advanced.topP,
                    frequency_penalty: config.steps[i].customParams ? config.steps[i].params.frequencyPenalty : config.advanced.frequencyPenalty,
                    presence_penalty: config.steps[i].customParams ? config.steps[i].params.presencePenalty : config.advanced.presencePenalty,
                    max_tokens: config.steps[i].customParams ? config.steps[i].params.maxTokens : config.advanced.maxTokens,
                    stop: config.steps[i].customParams ? config.steps[i].params.stopSequences : config.advanced.stopSequences,
                    stream: config.advanced.stream,
                    response_format: { type: config.advanced.responseFormat },
                }),
            });

            const data = await response.json();
            currentResponse = data.choices?.[0]?.message?.content;

            // If this step requires a checkpoint, include user input in next step
            if (step.checkpoint && i < config.steps.length - 1) {
                config.steps[i + 1].prompt = \`**The following is a summary of important context from previous steps to be used with the USER. **
{{ CHECKPOINT \${stepNumber} }}

USER Intent:
\${initialUserMessage}

Assistant Response:
\${currentResponse}

**Note: this summary checkpoint from the last Step is just for your reference**

\${config.steps[i + 1].prompt}\`;
            }

            console.log(\`Step \${stepNumber} complete. Response:\`, currentResponse);
        }
    } catch (error) {
        console.error("Error processing steps:", error);
        throw error;
    }

    return currentResponse;
}

// AI Response Generation
async function generateAIResponse(latestMessage) {
    try {
        const messages = constructMessages(latestMessage);
        console.log("Full conversation context:", messages);

        const response = await fetch(\`\${config.model.baseUrl}/chat/completions\`, {
            method: "POST",
            headers: {
                Authorization: \`Bearer \${API_KEY}\`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: config.model.model,
                messages: messages,
                temperature: config.advanced.temperature,
                top_p: config.advanced.topP,
                frequency_penalty: config.advanced.frequencyPenalty,
                presence_penalty: config.advanced.presencePenalty,
                max_tokens: config.advanced.maxTokens,
                stop: config.advanced.stopSequences,
                stream: config.advanced.stream,
                response_format: { type: config.advanced.responseFormat },
            }),
        });

        const data = await response.json();
        let assistantResponse = data.choices?.[0]?.message?.content;

        // Process through steps if configured
        if (config.steps) {
            console.log("Processing response through steps...");
            assistantResponse = await processSteps(latestMessage, assistantResponse);
        }

        // Store the assistant's response in conversation history
        conversationHistory.push({
            role: "assistant",
            content: assistantResponse,
            timestamp: new Date().toISOString(),
        });

        console.log("Conversation History:", conversationHistory);

        return assistantResponse;
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}

// Send Message to Room
async function sendMessageToRoom(content) {
    try {
        const response = await fetch(\`\${ROOM_API_URL}/\${ROOM_NAME}/message\`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": EC_API_KEY,
            },
            body: JSON.stringify({
                content: content,
                sender: {
                    username: USER_NAME,
                    model: config.model.model,
                },
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending message to room:", error);
        throw error;
    }
}

// Main function to process and send AI response
async function processAndSendAIResponse(userMessage = null) {
    try {
        // Get room history
        const history = await getRoomHistory();
        const lastMessage = addMessageContext(history);

        // Only proceed if we have a message to respond to
        if (lastMessage || userMessage) {
            const messageToRespond = userMessage || lastMessage.content;
            console.log("Responding to message:", messageToRespond);

            const aiResponse = await generateAIResponse(messageToRespond);
            const result = await sendMessageToRoom(aiResponse);
            console.log("Message sent successfully:", result);
            return result;
        } else {
            console.log("No new messages to respond to");
        }
    } catch (error) {
        console.error("Error in processing and sending AI response:", error);
        throw error;
    }
}

// Initialize conversation when the server starts
await initializeConversation();

// Initial message processing
await processAndSendAIResponse();

// Set up cron job
cron.schedule(CRON_SCHEDULE, async () => {
    console.log("Running scheduled message task at:", new Date().toISOString());
    try {
        await processAndSendAIResponse();
    } catch (error) {
        console.error("Error in scheduled task:", error);
    }
});

// Export functions for modular use
export { generateAIResponse, sendMessageToRoom, processAndSendAIResponse, initializeConversation };`;
