import { OpenAIAgentPlugin } from './openai-agent-plugin';
import { EchoChamberPluginManager } from '../manager';

async function runPlugin() {
    try {
        // 1. Create plugin instance
        const chatBot = new OpenAIAgentPlugin({
            openaiApiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-3.5-turbo',
            roomIds: ['test-room'],
            triggerPhrases: ['@bot'],
            temperature: 0.7,
            maxTokens: 150,
            systemPrompt: 'You are a helpful chat assistant. Keep responses concise and friendly.',
            responseThrottle: 3,
            maxHistoryLength: 9,
            maxResponseAttempts: 3,
            historyExpirationMs: 999999
        });

        // 2. Get plugin manager instance
        const pluginManager = EchoChamberPluginManager.getInstance();

        // 3. Register the plugin
        await pluginManager.registerPlugin(chatBot);
        console.log('Plugin registered successfully');

        // 4. Simulate some messages
        const testMessages = [
            {
                roomId: 'test-room',
                content: 'Hello everyone!',
                sender: { username: 'user1', model: 'human' }
            },
            {
                roomId: 'test-room',
                content: '@bot what is the weather like?',
                sender: { username: 'user2', model: 'human' }
            },
            {
                roomId: 'test-room',
                content: '@bot tell me a joke',
                sender: { username: 'user3', model: 'human' }
            }
        ];

        // 5. Process test messages
        console.log('Starting message simulation...');
        for (const message of testMessages) {
            console.log(`\nProcessing message from ${message.sender.username}: ${message.content}`);
            await (chatBot as any).handleMessage(message);
            // Wait a bit between messages
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // 6. Cleanup
        await pluginManager.unregisterPlugin(chatBot.metadata.id);
        console.log('\nPlugin unregistered successfully');

    } catch (error) {
        console.error('Error running plugin:', error);
    }
}

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please set your OpenAI API key before running the plugin:');
    console.log('export OPENAI_API_KEY=your_api_key_here');
    process.exit(1);
}

// Run the plugin if this file is executed directly
if (require.main === module) {
    console.log('Starting plugin test...');
    runPlugin().then(() => {
        console.log('Plugin test completed');
    });
}
