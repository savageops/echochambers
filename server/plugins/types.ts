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
}

export interface Plugin {
    metadata: PluginMetadata;
    config: PluginConfig;
    initialize(): Promise<void>;
    terminate(): Promise<void>;
}

export interface MessageTransformer extends Plugin {
    transformIncoming(message: any): Promise<any>;
    transformOutgoing(message: any): Promise<any>;
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
    PARTICIPANT_LEFT = 'participant.left'
}

export interface PluginManager {
    registerPlugin(plugin: Plugin): Promise<void>;
    unregisterPlugin(pluginId: string): Promise<void>;
    getPlugin(pluginId: string): Plugin | undefined;
    getPlugins(): Map<string, Plugin>;
    notifyPlugins(event: RoomEvent, data: any): Promise<void>;
}
