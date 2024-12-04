import { Plugin, PluginManager, RoomEvent, PluginError, WebhookError } from './types';
import { withRetry, isValidWebhookUrl, safeStringify } from './utils';

/**
 * Core plugin management implementation utilizing singleton pattern
 * for centralized plugin orchestration across the application.
 * 
 * Provides:
 * - Plugin lifecycle management
 * - Event distribution system
 * - Inter-plugin communication
 * - Webhook notifications
 */
class EchoChamberPluginManager implements PluginManager {
    private plugins: Map<string, Plugin> = new Map();
    private static instance: EchoChamberPluginManager;

    private constructor() {
        // Make plugin manager globally accessible for emit() method
        (global as any).pluginManager = this;
    }

    static getInstance(): EchoChamberPluginManager {
        if (!EchoChamberPluginManager.instance) {
            EchoChamberPluginManager.instance = new EchoChamberPluginManager();
        }
        return EchoChamberPluginManager.instance;
    }

    async registerPlugin(plugin: Plugin): Promise<void> {
        if (this.plugins.has(plugin.metadata.id)) {
            throw new PluginError(
                `Plugin ${plugin.metadata.id} is already registered`,
                plugin.metadata.id
            );
        }

        if (plugin.config.webhookUrl && !isValidWebhookUrl(plugin.config.webhookUrl)) {
            throw new PluginError(
                `Invalid webhook URL for plugin ${plugin.metadata.id}`,
                plugin.metadata.id
            );
        }

        try {
            await plugin.initialize();
            this.plugins.set(plugin.metadata.id, plugin);
            console.log(`Plugin ${plugin.metadata.id} registered successfully`);
            
            await this.notifyPlugins(RoomEvent.PLUGIN_REGISTERED, {
                pluginId: plugin.metadata.id,
                metadata: plugin.metadata
            });
        } catch (error) {
            const pluginError = new PluginError(
                `Failed to register plugin ${plugin.metadata.id}`,
                plugin.metadata.id,
                error as Error
            );
            console.error(pluginError);
            throw pluginError;
        }
    }

    async unregisterPlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new PluginError(
                `Plugin ${pluginId} not found`,
                pluginId
            );
        }

        try {
            await plugin.terminate();
            this.plugins.delete(pluginId);
            console.log(`Plugin ${pluginId} unregistered successfully`);

            await this.notifyPlugins(RoomEvent.PLUGIN_UNREGISTERED, {
                pluginId: plugin.metadata.id
            });
        } catch (error) {
            const pluginError = new PluginError(
                `Failed to unregister plugin ${pluginId}`,
                pluginId,
                error as Error
            );
            console.error(pluginError);
            throw pluginError;
        }
    }

    getPlugin(pluginId: string): Plugin | undefined {
        return this.plugins.get(pluginId);
    }

    getPlugins(): Map<string, Plugin> {
        return this.plugins;
    }

    async notifyPlugins(event: RoomEvent, data: any): Promise<void> {
        const notifications = Array.from(this.plugins.values())
            .filter(plugin => plugin.config.eventSubscriptions?.includes(event))
            .map(async (plugin) => {
                try {
                    // Handle event through plugin's event system
                    await (plugin as any).handleEvent(event, data);

                    // Send webhook notification if configured
                    if (plugin.config.webhookUrl) {
                        await this.sendWebhookNotification(plugin, event, data);
                    }
                } catch (error) {
                    console.error(
                        `Failed to notify plugin ${plugin.metadata.id}:`,
                        error instanceof Error ? error.message : 'Unknown error'
                    );
                    
                    await plugin.onError?.(error as Error);
                    
                    if (event !== RoomEvent.PLUGIN_ERROR) {
                        await this.notifyPlugins(RoomEvent.PLUGIN_ERROR, {
                            pluginId: plugin.metadata.id,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            event,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });

        await Promise.all(notifications);
    }

    private async sendWebhookNotification(plugin: Plugin, event: RoomEvent, data: any): Promise<void> {
        const webhookData = {
            event,
            data,
            timestamp: new Date().toISOString(),
            plugin: {
                id: plugin.metadata.id,
                name: plugin.metadata.name,
                version: plugin.metadata.version
            }
        };

        await withRetry(
            async () => {
                const response = await fetch(plugin.config.webhookUrl!, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Plugin-ID': plugin.metadata.id,
                        'X-Event-Type': event,
                        'X-API-Key': plugin.config.apiKey || ''
                    },
                    body: safeStringify(webhookData)
                });

                if (!response.ok) {
                    throw new WebhookError(
                        plugin.metadata.id,
                        response.status,
                        await response.text()
                    );
                }
            },
            {
                attempts: plugin.config.retryAttempts,
                delay: plugin.config.retryDelay,
                onError: (error, attempt) => {
                    console.warn(
                        `Webhook delivery attempt ${attempt} failed for plugin ${plugin.metadata.id}:`,
                        error.message
                    );
                }
            }
        );
    }
}

export { EchoChamberPluginManager };
