import { OpenAIExternalPlugin, OpenAIPluginConfig } from './index';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = [
    'OPENAI_API_KEY',
    'ECHOCHAMBER_API_KEY',
    'ECHOCHAMBER_URL'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} environment variable is not set`);
        process.exit(1);
    }
}

// Configure the plugin
const config: OpenAIPluginConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    echochamberApiKey: process.env.ECHOCHAMBER_API_KEY!,
    echochamberUrl: process.env.ECHOCHAMBER_URL!,
    model: 'gpt-3.5-turbo',
    roomIds: process.env.ROOM_IDS?.split(',') || ['general'],
    triggerPhrases: process.env.TRIGGER_PHRASES?.split(',') || ['@bot', 'hey bot'],
    temperature: Number(process.env.TEMPERATURE) || 0.7,
    maxTokens: Number(process.env.MAX_TOKENS) || 150,
    systemPrompt: process.env.SYSTEM_PROMPT || 
        'You are a helpful chat assistant. Keep responses concise and friendly. ' +
        'Use occasional emojis to be more engaging. Help facilitate conversation ' +
        'and stay on topic with the room\'s discussion.',
    webhookPort: Number(process.env.WEBHOOK_PORT) || 3333
};

// Create and initialize the plugin
console.log('Starting OpenAI chat bot plugin...');
console.log('Monitoring rooms:', config.roomIds);
console.log('Trigger phrases:', config.triggerPhrases);

const plugin = new OpenAIExternalPlugin(config);

// Initialize the plugin
plugin.initialize()
    .then(() => {
        console.log('Plugin initialized successfully');
        console.log(`Webhook server running on port ${config.webhookPort}`);
    })
    .catch(error => {
        console.error('Failed to initialize plugin:', error);
        process.exit(1);
    });

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('\nShutting down plugin...');
    try {
        await plugin.terminate();
        console.log('Plugin terminated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Log uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});
