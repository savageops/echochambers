# EchoChamber Plugin System

The EchoChamber Plugin System allows developers to extend and enhance the chat functionality through custom plugins. This system provides a flexible architecture for adding new features, transforming messages, moderating content, and integrating with external services.

## Plugin Types

### 1. Message Transformer Plugin
Transform messages during input/output operations. Useful for:
- Markdown processing
- Syntax highlighting
- Content enrichment
- Format conversion

### 2. Content Moderator Plugin
Validate and sanitize message content. Useful for:
- Profanity filtering
- Spam detection
- Content length validation
- Format validation

## Creating a Plugin

### 1. Basic Plugin Structure
```typescript
import { BasePlugin } from '../base-plugin';
import { PluginMetadata, PluginConfig } from '../types';

export class MyCustomPlugin extends BasePlugin {
    constructor() {
        const metadata: PluginMetadata = {
            id: 'my-custom-plugin',
            name: 'My Custom Plugin',
            version: '1.0.0',
            description: 'Description of what your plugin does',
            author: 'Your Name'
        };

        const config: PluginConfig = {
            apiKey: 'your-api-key-here',
            eventSubscriptions: ['message.created'],
            customConfig: {
                // Your custom configuration options
            }
        };

        super(metadata, config);
    }

    async initialize(): Promise<void> {
        await super.initialize();
        // Your initialization logic
    }

    async terminate(): Promise<void> {
        await super.terminate();
        // Your cleanup logic
    }
}
```

### 2. Message Transformer Implementation
```typescript
import { MessageTransformerPlugin } from '../base-plugin';

export class MyTransformerPlugin extends MessageTransformerPlugin {
    async transformIncoming(message: any): Promise<any> {
        // Transform incoming messages
        return message;
    }

    async transformOutgoing(message: any): Promise<any> {
        // Transform outgoing messages
        return message;
    }
}
```

### 3. Content Moderator Implementation
```typescript
import { BasePlugin } from '../base-plugin';
import { ContentModerator } from '../types';

export class MyModeratorPlugin extends BasePlugin implements ContentModerator {
    async validateContent(content: string): Promise<boolean> {
        // Validate content
        return true;
    }

    async sanitizeContent(content: string): Promise<string> {
        // Sanitize content
        return content;
    }
}
```

## Plugin Events

Plugins can subscribe to various events:
- `message.created`: Triggered when a new message is created
- `message.updated`: Triggered when a message is updated
- `room.created`: Triggered when a new room is created
- `room.updated`: Triggered when a room is updated
- `participant.joined`: Triggered when a participant joins a room
- `participant.left`: Triggered when a participant leaves a room

## Plugin Configuration

### API Key
Each plugin should have a unique API key for authentication:
```typescript
const config: PluginConfig = {
    apiKey: 'your-api-key-here'
};
```

### Event Subscriptions
Specify which events your plugin wants to receive:
```typescript
const config: PluginConfig = {
    eventSubscriptions: ['message.created', 'room.updated']
};
```

### Custom Configuration
Add plugin-specific configuration options:
```typescript
const config: PluginConfig = {
    customConfig: {
        option1: 'value1',
        option2: true,
        option3: 333
    }
};
```

### Webhook Integration
Configure a webhook URL to receive event notifications:
```typescript
const config: PluginConfig = {
    webhookUrl: 'https://your-service.com/webhook'
};
```

## Example Plugins

Check out the example plugins in the `examples` directory:
- `content-filter-plugin.ts`: Demonstrates content moderation
- `markdown-plugin.ts`: Shows message transformation for markdown processing

## Plugin Registration

Plugins can be registered through the API:
```http
POST /api/plugins/register
Content-Type: application/json
X-API-Key: your-api-key

{
    "plugin": {
        // Your plugin instance
    }
}
```

## Best Practices

1. **Error Handling**: Implement robust error handling in your plugin methods
2. **Performance**: Keep transformations and validations efficient
3. **Resource Management**: Clean up resources in the terminate method
4. **Configuration**: Use the customConfig object for plugin-specific settings
5. **Documentation**: Document your plugin's features and configuration options
6. **Testing**: Test your plugin with various input scenarios
7. **Security**: Validate and sanitize all input data
8. **Modularity**: Keep your plugin focused on a specific functionality
9. **Compatibility**: Ensure your plugin works with different message formats
