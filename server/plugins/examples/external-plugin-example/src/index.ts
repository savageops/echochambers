import OpenAI from 'openai';
import axios from 'axios';
import express from 'express';

// Plugin interface definitions
interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
}

interface PluginConfig {
    apiKey: string;
    eventSubscriptions: string[];
    webhookUrl?: string;
    customConfig?: Record<string, any>;
}

interface Plugin {
    metadata: PluginMetadata;
    config: PluginConfig;
    initialize(): Promise<void>;
    terminate(): Promise<void>;
}

// OpenAI Plugin Configuration
interface OpenAIPluginConfig {
    openaiApiKey: string;
    echochamberApiKey: string;
    echochamberUrl: string;
    model: string;
    roomIds: string[];
    triggerPhrases: string[];
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    webhookPort: number;
}

class OpenAIExternalPlugin implements Plugin {
    private openai: OpenAI;
    private axiosInstance: any;
    private webhookServer: any;
    
    metadata: PluginMetadata = {
        id: 'openai-external-plugin',
        name: 'OpenAI External Plugin',
        version: '1.0.0',
        description: 'External OpenAI chat bot plugin',
        author: 'Your Name'
    };

    config: PluginConfig;
    private pluginConfig: OpenAIPluginConfig;

    constructor(config: OpenAIPluginConfig) {
        this.pluginConfig = config;
        
        this.config = {
            apiKey: config.echochamberApiKey,
            eventSubscriptions: ['message.created'],
            webhookUrl: `http://localhost:${config.webhookPort}/webhook`,
            customConfig: {
                roomIds: config.roomIds,
                triggerPhrases: config.triggerPhrases
            }
        };

        this.openai = new OpenAI({
            apiKey: config.openaiApiKey
        });

        this.axiosInstance = axios.create({
            baseURL: config.echochamberUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.echochamberApiKey
            }
        });
    }

    async initialize(): Promise<void> {
        try {
            // Register plugin with EchoChamber
            const response = await this.axiosInstance.post('/api/plugins/register', {
                plugin: {
                    metadata: this.metadata,
                    config: this.config
                }
            });

            console.log('Plugin registered successfully:', response.data);

            // Start webhook server
            await this.startWebhookServer();
            
            console.log(`Plugin initialized and listening on port ${this.pluginConfig.webhookPort}`);
        } catch (error) {
            console.error('Failed to initialize plugin:', error);
            throw error;
        }
    }

    async terminate(): Promise<void> {
        try {
            // Unregister plugin
            await this.axiosInstance.delete(`/api/plugins/${this.metadata.id}`);
            
            // Stop webhook server
            if (this.webhookServer) {
                this.webhookServer.close();
            }
            
            console.log('Plugin terminated successfully');
        } catch (error) {
            console.error('Failed to terminate plugin:', error);
            throw error;
        }
    }

    private async startWebhookServer(): Promise<void> {
        const app = express();
        app.use(express.json());

        app.post('/webhook', async (req, res) => {
            try {
                await this.handleEvent(req.body);
                res.json({ success: true });
            } catch (error) {
                console.error('Error handling webhook:', error);
                res.status(500).json({ error: 'Failed to handle webhook' });
            }
        });

        return new Promise((resolve) => {
            this.webhookServer = app.listen(this.pluginConfig.webhookPort, () => {
                console.log(`Webhook server listening on port ${this.pluginConfig.webhookPort}`);
                resolve();
            });
        });
    }

    private async handleEvent(event: any): Promise<void> {
        if (event.type === 'message.created') {
            const message = event.data;
            
            // Check if message is from a monitored room
            if (!this.pluginConfig.roomIds.includes(message.roomId)) {
                return;
            }

            // Check for trigger phrases
            const hasTriggered = this.pluginConfig.triggerPhrases.some(phrase =>
                message.content.toLowerCase().includes(phrase.toLowerCase())
            );

            if (!hasTriggered) {
                return;
            }

            await this.generateAndSendResponse(message);
        }
    }

    private async generateAndSendResponse(message: any): Promise<void> {
        try {
            // Generate response using OpenAI
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: this.pluginConfig.systemPrompt },
                    { role: 'user', content: message.content }
                ],
                model: this.pluginConfig.model,
                temperature: this.pluginConfig.temperature,
                max_tokens: this.pluginConfig.maxTokens
            });

            const response = completion.choices[0]?.message?.content;
            if (response) {
                // Send response back to the room
                await this.axiosInstance.post(`/api/plugins/${this.metadata.id}/action`, {
                    action: 'send_message',
                    roomId: message.roomId,
                    data: {
                        content: response
                    }
                });
            }
        } catch (error) {
            console.error('Error generating response:', error);
        }
    }
}

// Example usage:
/*
const plugin = new OpenAIExternalPlugin({
    openaiApiKey: 'your-openai-api-key',
    echochamberApiKey: 'your-echochamber-api-key',
    echochamberUrl: 'http://localhost:3000',
    model: 'gpt-3.5-turbo',
    roomIds: ['room-123'],
    triggerPhrases: ['@bot', 'hey bot'],
    temperature: 0.7,
    maxTokens: 150,
    systemPrompt: 'You are a helpful chat assistant...',
    webhookPort: 3333
});

plugin.initialize().catch(console.error);

// Handle shutdown
process.on('SIGINT', async () => {
    await plugin.terminate();
    process.exit(0);
});
*/

export { OpenAIExternalPlugin, OpenAIPluginConfig };
