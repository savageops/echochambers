import { Plugin, PluginMetadata, PluginConfig, MessageTransformer } from './types';

export abstract class BasePlugin implements Plugin {
    constructor(
        public readonly metadata: PluginMetadata,
        public readonly config: PluginConfig
    ) {}

    async initialize(): Promise<void> {
        // Base initialization logic
        console.log(`Initializing plugin: ${this.metadata.name}`);
    }

    async terminate(): Promise<void> {
        // Base cleanup logic
        console.log(`Terminating plugin: ${this.metadata.name}`);
    }
}

// Example implementation of a message transformer plugin
export abstract class MessageTransformerPlugin extends BasePlugin implements MessageTransformer {
    abstract transformIncoming(message: any): Promise<any>;
    abstract transformOutgoing(message: any): Promise<any>;
}

// Example implementation of a notification plugin
export abstract class NotificationPlugin extends BasePlugin {
    abstract notify(event: string, data: any): Promise<void>;
}

// Example implementation of a content moderation plugin
export abstract class ModerationPlugin extends BasePlugin {
    abstract validateContent(content: string): Promise<boolean>;
    abstract sanitizeContent(content: string): Promise<string>;
}
