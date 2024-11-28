# OpenAI Agent Plugin

A plugin for EchoChamber that creates an AI chat agent using OpenAI's API. The agent can monitor specific rooms and respond to messages based on configured triggers and rules.

## Installation

1. Install the required OpenAI package:
```bash
npm install openai
```

2. Add the plugin to your EchoChamber instance:
```typescript
import { OpenAIAgentPlugin } from './plugins/examples/openai-agent-plugin';

const agent = new OpenAIAgentPlugin({
    openaiApiKey: 'your-openai-api-key',
    model: 'gpt-3.5-turbo',
    roomIds: ['room-123'],
    triggerPhrases: ['@bot', 'hey bot'],
    temperature: 0.7,
    maxTokens: 150,
    systemPrompt: 'You are a helpful assistant in a chat room. Keep responses concise and friendly.',
    responseThrottle: 3,
    maxHistoryLength: 9,
    maxResponseAttempts: 3,
    historyExpirationMs: 999999
});

// Register the plugin
const pluginManager = EchoChamberPluginManager.getInstance();
await pluginManager.registerPlugin(agent);
```

## Configuration Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| openaiApiKey | string | Your OpenAI API key | 'sk-...' |
| model | string | OpenAI model to use | 'gpt-3.5-turbo' |
| roomIds | string[] | Array of room IDs to monitor | ['room-123', 'room-456'] |
| triggerPhrases | string[] | Phrases that trigger the bot (optional) | ['@bot', 'hey bot'] |
| temperature | number | OpenAI temperature setting (0-1) | 0.7 |
| maxTokens | number | Maximum response length | 150 |
| systemPrompt | string | Base personality/behavior prompt | 'You are a helpful assistant...' |
| responseThrottle | number | Minimum seconds between responses | 3 |
| maxHistoryLength | number | Number of messages to keep for context | 9 |
| maxResponseAttempts | number | Max retries for API calls | 3 |
| historyExpirationMs | number | Clear history after this many ms | 999999 |

## Features

### Room Monitoring
The agent can monitor multiple rooms simultaneously:
```typescript
const agent = new OpenAIAgentPlugin({
    roomIds: ['room-123', 'room-456'],
    // ... other config
});
```

### Trigger Phrases
Configure specific phrases that trigger the bot:
```typescript
const agent = new OpenAIAgentPlugin({
    triggerPhrases: ['@bot', 'hey bot', '!ask'],
    // ... other config
});
```

### Customizable Personality
Set the agent's personality through the system prompt:
```typescript
const agent = new OpenAIAgentPlugin({
    systemPrompt: `You are a friendly chat room assistant named EchoBot.
    Keep responses concise and helpful.
    Use emojis occasionally to be more engaging.
    Never reveal that you are an AI.`,
    // ... other config
});
```

### Rate Limiting
Prevent spam by setting a response throttle:
```typescript
const agent = new OpenAIAgentPlugin({
    responseThrottle: 3, // Wait 3 seconds between responses
    // ... other config
});
```

### Context Management
Maintain conversation context with history settings:
```typescript
const agent = new OpenAIAgentPlugin({
    maxHistoryLength: 9, // Keep last 9 messages for context
    historyExpirationMs: 999999, // Clear history after ~16 minutes
    // ... other config
});
```

## Example Usage

### Basic Setup
```typescript
const agent = new OpenAIAgentPlugin({
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    roomIds: ['general-chat'],
    triggerPhrases: ['@bot'],
    temperature: 0.7,
    maxTokens: 150,
    systemPrompt: 'You are a helpful assistant in a chat room. Keep responses concise and friendly.',
    responseThrottle: 3,
    maxHistoryLength: 9,
    maxResponseAttempts: 3,
    historyExpirationMs: 999999
});
```

### Support Bot Setup
```typescript
const supportBot = new OpenAIAgentPlugin({
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    roomIds: ['support'],
    temperature: 0.3,
    maxTokens: 300,
    systemPrompt: `You are a technical support specialist.
    Always ask clarifying questions before providing solutions.
    Format code examples using markdown.
    End each response with "Let me know if you need any clarification."`,
    responseThrottle: 1,
    maxHistoryLength: 12,
    maxResponseAttempts: 3,
    historyExpirationMs: 1800000 // 30 minutes
});
```

### Moderation Bot Setup
```typescript
const moderatorBot = new OpenAIAgentPlugin({
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    roomIds: ['all-rooms'],
    temperature: 0.2,
    maxTokens: 100,
    systemPrompt: `You are a chat room moderator.
    Monitor for inappropriate content.
    Politely remind users of chat rules when violated.
    Use a professional but friendly tone.`,
    responseThrottle: 5,
    maxHistoryLength: 3,
    maxResponseAttempts: 2,
    historyExpirationMs: 300000 // 5 minutes
});
```

## Best Practices

1. **API Key Security**: Never hardcode your OpenAI API key. Use environment variables.

2. **Rate Limiting**: Set appropriate `responseThrottle` values to prevent excessive API usage.

3. **Context Management**: Balance `maxHistoryLength` with token limits:
   - More history = better context but more tokens used
   - Less history = fewer tokens but less context

4. **System Prompts**: Write clear, specific system prompts that:
   - Define the agent's role and personality
   - Set clear boundaries and limitations
   - Specify preferred response formats

5. **Error Handling**: Set reasonable `maxResponseAttempts` for your use case:
   - Higher values = more reliable but slower recovery
   - Lower values = faster recovery but more potential failures

6. **Memory Management**: Use appropriate `historyExpirationMs`:
   - Longer for support/complex conversations
   - Shorter for casual chat/moderation

7. **Model Selection**: Choose appropriate models:
   - gpt-4: Complex reasoning, support roles
   - gpt-3.5-turbo: General chat, moderation

8. **Temperature Settings**:
   - Higher (0.7-1.0): Creative, casual conversation
   - Lower (0.2-0.5): Technical support, moderation
