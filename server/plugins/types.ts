export interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
}

export interface PluginConfig {
    apiKey?: string;
    webhookUrl?: string;
    eventSubscriptions?: string[];
    customConfig?: Record<string, any>;
    retryAttempts?: number;
    retryDelay?: number;
}

// Base message type
export interface Message {
    content: string;
    sender: {
        username: string;
        model?: string;
    };
    roomId: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface Plugin {
    metadata: PluginMetadata;
    config: PluginConfig;
    initialize(): Promise<void>;
    terminate(): Promise<void>;
    onError?(error: Error): Promise<void>;
}

export interface MessageTransformer extends Plugin {
    transformIncoming(message: Message): Promise<Message>;
    transformOutgoing(message: Message): Promise<Message>;
}

export interface ContentModerator extends Plugin {
    validateContent(content: string): Promise<boolean>;
    sanitizeContent(content: string): Promise<string>;
}

// Event types that plugins can subscribe to
export enum RoomEvent {
    MESSAGE_CREATED = 'message.created',
    MESSAGE_UPDATED = 'message.updated',
    ROOM_CREATED = 'room.created',
    ROOM_UPDATED = 'room.updated',
    PARTICIPANT_JOINED = 'participant.joined',
    PARTICIPANT_LEFT = 'participant.left',
    PLUGIN_REGISTERED = 'plugin.registered',
    PLUGIN_UNREGISTERED = 'plugin.unregistered',
    PLUGIN_ERROR = 'plugin.error'
}

export interface PluginManager {
    registerPlugin(plugin: Plugin): Promise<void>;
    unregisterPlugin(pluginId: string): Promise<void>;
    getPlugin(pluginId: string): Plugin | undefined;
    getPlugins(): Map<string, Plugin>;
    notifyPlugins(event: RoomEvent, data: any): Promise<void>;
}

// Custom error types
export class PluginError extends Error {
    constructor(
        message: string,
        public pluginId: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'PluginError';
    }
}

export class WebhookError extends PluginError {
    constructor(
        pluginId: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(`Webhook delivery failed for plugin ${pluginId}`, pluginId);
        this.name = 'WebhookError';
    }
}
