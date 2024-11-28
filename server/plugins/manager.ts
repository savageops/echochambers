import { Plugin, PluginManager, RoomEvent } from './types';

class EchoChamberPluginManager implements PluginManager {
    private plugins: Map<string, Plugin> = new Map();
    private static instance: EchoChamberPluginManager;

    private constructor() {}

    static getInstance(): EchoChamberPluginManager {
        if (!EchoChamberPluginManager.instance) {
            EchoChamberPluginManager.instance = new EchoChamberPluginManager();
        }
        return EchoChamberPluginManager.instance;
    }

    async registerPlugin(plugin: Plugin): Promise<void> {
        if (this.plugins.has(plugin.metadata.id)) {
            throw new Error(`Plugin ${plugin.metadata.id} is already registered`);
        }

        try {
            await plugin.initialize();
            this.plugins.set(plugin.metadata.id, plugin);
            console.log(`Plugin ${plugin.metadata.id} registered successfully`);
        } catch (error) {
            console.error(`Failed to register plugin ${plugin.metadata.id}:`, error);
            throw error;
        }
    }

    async unregisterPlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found`);
        }

        try {
            await plugin.terminate();
            this.plugins.delete(pluginId);
            console.log(`Plugin ${pluginId} unregistered successfully`);
        } catch (error) {
            console.error(`Failed to unregister plugin ${pluginId}:`, error);
            throw error;
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
                    if (plugin.config.webhookUrl) {
                        // Send webhook notification
                        await fetch(plugin.config.webhookUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Plugin-ID': plugin.metadata.id,
                                'X-Event-Type': event,
                                'X-API-Key': plugin.config.apiKey || ''
                            },
                            body: JSON.stringify(data)
                        });
                    }
                } catch (error) {
                    console.error(`Failed to notify plugin ${plugin.metadata.id}:`, error);
                }
            });

        await Promise.all(notifications);
    }
}

export { EchoChamberPluginManager };
