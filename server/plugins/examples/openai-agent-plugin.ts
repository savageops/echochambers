import { BasePlugin } from '../base-plugin';
import { PluginMetadata, PluginConfig, RoomEvent } from '../types';
// Note: Run 'npm install openai' to install the OpenAI package
import OpenAI from 'openai';

interface OpenAIAgentConfig {
    openaiApiKey: string;
    model: string;
    roomIds: string[];           // Rooms to monitor
    triggerPhrases: string[];    // Optional phrases that trigger the bot
    temperature: number;         // OpenAI temperature setting
    maxTokens: number;          // Max response length
    systemPrompt: string;       // Base personality/behavior prompt
    responseThrottle: number;   // Minimum seconds between responses
    maxHistoryLength: number;   // Number of messages to keep for context
    maxResponseAttempts: number; // Max retries for API calls
    historyExpirationMs: number; // Clear history after this many ms
}

/**
 * OpenAIAgentPlugin
 * 
 * A plugin that creates an AI chat agent using OpenAI's API. The agent monitors
 * specific rooms and responds to messages based on configured triggers and rules.
 * 
 * Setup:
 * ```bash
 * npm install openai
 * ```
 * 
 * Features:
 * - Room-specific monitoring
 * - Configurable trigger phrases
 * - Customizable AI personality via system prompt
 * - Rate limiting to prevent spam
 * - Message history context maintenance
 * 
 * Usage:
 * ```typescript
 * const agent = new OpenAIAgentPlugin({
 *   openaiApiKey: 'your-key',
 *   model: 'gpt-3.5-turbo',
 *   roomIds: ['room-123'],
 *   triggerPhrases: ['@bot', 'hey bot'],
 *   temperature: 0.7,
 *   maxTokens: 150,
 *   systemPrompt: 'You are a helpful assistant...',
 *   responseThrottle: 3,
 *   maxHistoryLength: 9,
 *   maxResponseAttempts: 3,
 *   historyExpirationMs: 999999
 * });
 * ```
 */
export class OpenAIAgentPlugin extends BasePlugin {
    private openai: OpenAI = new OpenAI;
    private lastResponseTime: Map<string, number> = new Map();
    private messageHistory: Map<string, Array<{ role: string, content: string }>> = new Map();
    
    constructor(agentConfig: OpenAIAgentConfig) {
        const metadata: PluginMetadata = {
            id: 'openai-agent-plugin',
            name: 'OpenAI Agent Plugin',
            version: '1.0.0',
            description: 'AI chat agent powered by OpenAI',
            author: 'EchoChamber'
        };

        const config: PluginConfig = {
            apiKey: 'your-api-key-here',
            eventSubscriptions: [RoomEvent.MESSAGE_CREATED],
            webhookUrl: undefined,
            customConfig: agentConfig
        };

        super(metadata, config);
    }

    async initialize(): Promise<void> {
        await super.initialize();
        
        const config = this.config.customConfig as OpenAIAgentConfig;
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey
        });

        console.log('OpenAI Agent Plugin: Initialized for rooms:', config.roomIds);
        
        // Set up history cleanup interval
        setInterval(() => this.cleanupHistory(), config.historyExpirationMs);
    }

    async terminate(): Promise<void> {
        await super.terminate();
        // Clear message history and response timers
        this.messageHistory.clear();
        this.lastResponseTime.clear();
    }

    /**
     * Handles incoming messages and generates responses when appropriate
     */
    async handleMessage(message: any): Promise<void> {
        const config = this.config.customConfig as OpenAIAgentConfig;
        
        // Check if message is from a monitored room
        if (!config.roomIds.includes(message.roomId)) {
            return;
        }

        // Check rate limiting
        const now = Date.now();
        const lastResponse = this.lastResponseTime.get(message.roomId) || 0;
        if (now - lastResponse < config.responseThrottle * 1000) {
            return;
        }

        // Check trigger phrases if configured
        if (config.triggerPhrases?.length > 0) {
            const hasTriggered = config.triggerPhrases.some(phrase => 
                message.content.toLowerCase().includes(phrase.toLowerCase())
            );
            if (!hasTriggered) {
                return;
            }
        }

        // Update message history
        this.updateMessageHistory(message);

        // Generate and send response
        try {
            const response = await this.generateResponse(message.roomId);
            if (response) {
                // Here you would use your chat system's API to send the message
                // This is a placeholder for the actual message sending logic
                console.log('Agent Response:', response);
                
                this.lastResponseTime.set(message.roomId, now);
            }
        } catch (error) {
            console.error('Failed to generate response:', error);
        }
    }

    /**
     * Maintains conversation history for context
     */
    private updateMessageHistory(message: any): void {
        const config = this.config.customConfig as OpenAIAgentConfig;
        const history = this.messageHistory.get(message.roomId) || [];

        history.push({
            role: 'user',
            content: `${message.sender.username}: ${message.content}`
        });

        // Maintain history length limit
        if (history.length > config.maxHistoryLength) {
            history.splice(0, history.length - config.maxHistoryLength);
        }

        this.messageHistory.set(message.roomId, history);
    }

    /**
     * Cleans up expired message history
     */
    private cleanupHistory(): void {
        const now = Date.now();
        for (const [roomId, lastResponse] of this.lastResponseTime.entries()) {
            if (now - lastResponse >= (this.config.customConfig as OpenAIAgentConfig).historyExpirationMs) {
                this.messageHistory.delete(roomId);
                this.lastResponseTime.delete(roomId);
            }
        }
    }

    /**
     * Generates response using OpenAI API
     */
    private async generateResponse(roomId: string): Promise<string | null> {
        const config = this.config.customConfig as OpenAIAgentConfig;
        const history = this.messageHistory.get(roomId) || [];

        const messages = [
            { role: 'system', content: config.systemPrompt },
            ...history
        ];

        let attempts = 0;
        while (attempts < config.maxResponseAttempts) {
            try {
                const completion = await this.openai.chat.completions.create({
                    messages: messages as any,
                    model: config.model,
                    temperature: config.temperature,
                    max_tokens: config.maxTokens
                });

                const response = completion.choices[0]?.message?.content;
                if (response) {
                    // Add response to history
                    history.push({
                        role: 'assistant',
                        content: response
                    });
                    this.messageHistory.set(roomId, history);
                }

                return response || null;
            } catch (error) {
                console.error(`OpenAI API Error (attempt ${attempts + 1}/${config.maxResponseAttempts}):`, error);
                attempts++;
                if (attempts === config.maxResponseAttempts) {
                    return null;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return null;
    }
}
