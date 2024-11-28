import { OpenAIAgentPlugin } from './openai-agent-plugin';
import { EchoChamberPluginManager } from '../manager';

/**
 * Example implementation of OpenAI Agent Plugin integration
 * This file demonstrates how to set up and use different types of AI agents
 */

// Create a general chat assistant
const createChatAssistant = () => {
    return new OpenAIAgentPlugin({
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        roomIds: ['general-chat'],
        triggerPhrases: ['@assistant', 'hey assistant'],
        temperature: 0.7,
        maxTokens: 150,
        systemPrompt: `You are a friendly and helpful chat room assistant.
        - Keep responses concise and engaging
        - Use occasional emojis to be more friendly
        - Help facilitate conversation
        - Answer questions when asked
        - Stay on topic with the room's discussion`,
        responseThrottle: 3,
        maxHistoryLength: 9,
        maxResponseAttempts: 3,
        historyExpirationMs: 999999
    });
};

// Create a technical support bot
const createSupportBot = () => {
    return new OpenAIAgentPlugin({
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4',
        roomIds: ['tech-support'],
        triggerPhrases: ['@support', 'help please'],
        temperature: 0.3,
        maxTokens: 300,
        systemPrompt: `You are a technical support specialist for EchoChamber.
        - First ask clarifying questions if the problem isn't clear
        - Provide step-by-step solutions
        - Use markdown for code examples
        - Explain technical concepts in simple terms
        - Follow up to ensure the solution worked
        - End responses with "Let me know if you need clarification"`,
        responseThrottle: 1,
        maxHistoryLength: 12,
        maxResponseAttempts: 3,
        historyExpirationMs: 1800000 // 30 minutes
    });
};

// Create a code review bot
const createCodeReviewBot = () => {
    return new OpenAIAgentPlugin({
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4',
        roomIds: ['code-review'],
        triggerPhrases: ['@review', 'review this:'],
        temperature: 0.2,
        maxTokens: 500,
        systemPrompt: `You are a senior software developer performing code reviews.
        - Focus on code quality and best practices
        - Identify potential bugs and security issues
        - Suggest performance improvements
        - Provide example code for improvements
        - Be constructive and educational
        - Format all code examples with proper markdown`,
        responseThrottle: 5,
        maxHistoryLength: 6,
        maxResponseAttempts: 3,
        historyExpirationMs: 1200000 // 20 minutes
    });
};

// Create a moderation bot
const createModerationBot = () => {
    return new OpenAIAgentPlugin({
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        roomIds: ['*'], // Monitor all rooms
        triggerPhrases: [], // No triggers - monitor all messages
        temperature: 0.2,
        maxTokens: 100,
        systemPrompt: `You are a chat room moderator.
        - Monitor for inappropriate content
        - Enforce chat room rules politely
        - Intervene only when necessary
        - Keep the conversation civil
        - Use a professional but friendly tone
        - Report serious violations to human moderators`,
        responseThrottle: 5,
        maxHistoryLength: 3,
        maxResponseAttempts: 2,
        historyExpirationMs: 300000 // 5 minutes
    });
};

/**
 * Initialize all bots for the chat system
 */
export const initializeChatBots = async () => {
    try {
        const pluginManager = EchoChamberPluginManager.getInstance();

        // Initialize different types of bots
        const chatAssistant = createChatAssistant();
        const supportBot = createSupportBot();
        const codeReviewBot = createCodeReviewBot();
        const moderationBot = createModerationBot();

        // Register all bots with the plugin manager
        await Promise.all([
            pluginManager.registerPlugin(chatAssistant),
            pluginManager.registerPlugin(supportBot),
            pluginManager.registerPlugin(codeReviewBot),
            pluginManager.registerPlugin(moderationBot)
        ]);

        console.log('Successfully initialized all chat bots');
    } catch (error) {
        console.error('Failed to initialize chat bots:', error);
        throw error;
    }
};

// Example usage in your application:
/*
import { initializeChatBots } from './plugins/examples/openai-agent-example';

// Initialize when your application starts
app.on('startup', async () => {
    await initializeChatBots();
    console.log('Chat bots are ready to assist');
});
*/
