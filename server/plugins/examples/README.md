# Running EchoChamber Plugins

This directory contains example plugins and scripts to run them. Here's how to use them:

## Quick Start

### Windows Users
```batch
# Navigate to the examples directory
cd server/plugins/examples

# Run the plugin with your OpenAI API key
run-plugin.bat your_openai_api_key_here
```

### Linux/Mac Users
```bash
# Navigate to the examples directory
cd server/plugins/examples

# Make the script executable
chmod +x run-plugin.sh

# Run the plugin with your OpenAI API key
./run-plugin.sh your_openai_api_key_here
```

### Manual Setup (All Platforms)
```bash
# Set your OpenAI API key
# Windows:
set OPENAI_API_KEY=your_openai_api_key_here
# Linux/Mac:
export OPENAI_API_KEY=your_openai_api_key_here

# Run the plugin
npx ts-node run-plugin.ts
```

## Available Example Plugins

1. **OpenAI Agent Plugin** (openai-agent-plugin.ts)
   - AI-powered chat bot
   - Responds to messages in specific rooms
   - Configurable trigger phrases
   - Maintains conversation context

2. **Content Filter Plugin** (content-filter-plugin.ts)
   - Content moderation
   - Profanity filtering
   - Message length validation

3. **Markdown Plugin** (markdown-plugin.ts)
   - Markdown to HTML conversion
   - Code syntax highlighting
   - Message formatting

## Testing Different Configurations

You can modify `run-plugin.ts` to test different configurations:

1. Change the room IDs:
```typescript
roomIds: ['your-room-id']
```

2. Modify trigger phrases:
```typescript
triggerPhrases: ['@bot', 'hey bot']
```

3. Adjust the AI behavior:
```typescript
systemPrompt: 'Your custom prompt here'
```

4. Change rate limiting:
```typescript
responseThrottle: 3 // seconds between responses
```

## Example Messages

The test script includes example messages that demonstrate:
- Regular chat messages
- Bot trigger phrases
- Different user interactions

You can modify these messages in `run-plugin.ts` to test different scenarios.

## Plugin Configuration

The OpenAI Agent Plugin can be configured with various options:

```typescript
const chatBot = new OpenAIAgentPlugin({
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',      // OpenAI model to use
    roomIds: ['test-room'],      // Rooms to monitor
    triggerPhrases: ['@bot'],    // Phrases that trigger the bot
    temperature: 0.7,            // AI response creativity (0-1)
    maxTokens: 150,              // Max response length
    systemPrompt: '...',         // Bot personality/behavior
    responseThrottle: 3,         // Seconds between responses
    maxHistoryLength: 9,         // Messages to keep for context
    maxResponseAttempts: 3,      // API retry attempts
    historyExpirationMs: 999999  // Context expiration time
});
```

## Troubleshooting

1. If you get OpenAI API errors:
   - Verify your API key is correct
   - Check your OpenAI account has available credits
   - Ensure the model specified is accessible to your account

2. If the plugin doesn't respond:
   - Check if the message includes a trigger phrase
   - Verify the message's room ID matches the configured rooms
   - Check the response throttle timing

3. If you get TypeScript errors:
   - Ensure all dependencies are installed
   - Check that your TypeScript version is compatible
   - Verify all required files are in the correct locations

4. Windows-specific issues:
   - If the batch file doesn't work, try setting the API key manually:
     ```batch
     set OPENAI_API_KEY=your_key_here
     npx ts-node run-plugin.ts
     ```
   - Make sure you're using the Command Prompt or PowerShell
   - Check that Node.js and TypeScript are properly installed

5. Linux/Mac-specific issues:
   - If the shell script doesn't run, check its permissions:
     ```bash
     chmod +x run-plugin.sh
     ```
   - Make sure you're using a compatible shell (bash/zsh)
   - Verify the script line endings are correct (LF not CRLF)
