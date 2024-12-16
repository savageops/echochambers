import { Plugin, PluginMetadata, PluginConfig, MessageTransformer, ContentModerator, Message, PluginError, RoomEvent } from './types';

type EventHandler = (data: any) => Promise<void>;

export abstract class BasePlugin implements Plugin {
    private eventHandlers: Map<RoomEvent, EventHandler[]> = new Map();

    constructor(
        public readonly metadata: PluginMetadata,
        public readonly config: PluginConfig
    ) {
        // Set default configuration values
        this.config = {
            retryAttempts: 3,
            retryDelay: 1000,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log(`Initializing plugin: ${this.metadata.name}`);
            await this.onInitialize?.();
        } catch (error) {
            throw new PluginError(
                `Failed to initialize plugin ${this.metadata.id}`,
                this.metadata.id,
                error as Error
            );
        }
    }

    async terminate(): Promise<void> {
        try {
            console.log(`Terminating plugin: ${this.metadata.name}`);
            await this.onTerminate?.();
        } catch (error) {
            throw new PluginError(
                `Failed to terminate plugin ${this.metadata.id}`,
                this.metadata.id,
                error as Error
            );
        }
    }

    async onError(error: Error): Promise<void> {
        console.error(`Plugin ${this.metadata.id} error:`, error);
    }

    /**
     * Register an event handler for a specific room event
     */
    protected on(event: RoomEvent, handler: EventHandler): void {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
    }

    /**
     * Handle an incoming event from the plugin manager
     */
    async handleEvent(event: RoomEvent, data: any): Promise<void> {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            await Promise.all(handlers.map(handler => handler(data)));
        }
    }

    /**
     * Emit an event through the plugin manager
     */
    protected async emit(event: RoomEvent, data: any): Promise<void> {
        try {
            // Get plugin manager instance
            const pluginManager = (global as any).pluginManager;
            if (!pluginManager) {
                throw new Error('Plugin manager not available');
            }

            // Emit event through plugin system
            await pluginManager.notifyPlugins(event, data);
        } catch (error) {
            console.error(`[${this.metadata.name}] Failed to emit event:`, error);
            throw error;
        }
    }

    // Optional lifecycle hooks that plugins can implement
    protected async onInitialize?(): Promise<void>;
    protected async onTerminate?(): Promise<void>;
}

export abstract class MessageTransformerPlugin extends BasePlugin implements MessageTransformer {
    async transformIncoming(message: Message): Promise<Message> {
        try {
            return await this.processIncoming(message);
        } catch (error) {
            await this.onError(error as Error);
            return message; // Return original message on error
        }
    }

    async transformOutgoing(message: Message): Promise<Message> {
        try {
            return await this.processOutgoing(message);
        } catch (error) {
            await this.onError(error as Error);
            return message; // Return original message on error
        }
    }

    // Abstract methods that must be implemented by concrete plugins
    protected abstract processIncoming(message: Message): Promise<Message>;
    protected abstract processOutgoing(message: Message): Promise<Message>;
}

export abstract class ContentModeratorPlugin extends BasePlugin implements ContentModerator {
    async validateContent(content: string): Promise<boolean> {
        try {
            return await this.processValidation(content);
        } catch (error) {
            await this.onError(error as Error);
            return true; // Allow content through on error
        }
    }

    async sanitizeContent(content: string): Promise<string> {
        try {
            return await this.processSanitization(content);
        } catch (error) {
            await this.onError(error as Error);
            return content; // Return original content on error
        }
    }

    // Abstract methods that must be implemented by concrete plugins
    protected abstract processValidation(content: string): Promise<boolean>;
    protected abstract processSanitization(content: string): Promise<string>;
}

// Utility mixin for adding retry capability to plugins
export function withRetry<T extends new (...args: any[]) => any>(Base: T) {
    return class extends Base {
        protected async withRetry<T>(
            operation: () => Promise<T>,
            attempts: number = this.config.retryAttempts || 3,
            delay: number = this.config.retryDelay || 1000
        ): Promise<T> {
            let lastError: Error | undefined;

            for (let i = 0; i < attempts; i++) {
                try {
                    return await operation();
                } catch (error) {
                    lastError = error as Error;
                    if (i < attempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2; // Exponential backoff
                    }
                }
            }

            throw lastError;
        }
    };
}
