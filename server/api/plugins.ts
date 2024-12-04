import { Router, Request, Response } from 'express';
import { EchoChamberPluginManager } from '../plugins/manager';
import { RoomEvent } from '../plugins/types';

const router = Router();
const pluginManager = EchoChamberPluginManager.getInstance();

// Middleware to verify plugin API key
const verifyPluginAuth = (req: Request, res: Response, next: Function) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    // In production, implement proper API key validation
    next();
};

/**
 * Plugin Registration
 * POST /api/plugins/register
 * Registers a new plugin with the system
 */
router.post('/register', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { plugin } = req.body;
        await pluginManager.registerPlugin(plugin);
        res.json({ 
            success: true, 
            message: 'Plugin registered successfully',
            pluginId: plugin.metadata.id
        });
    } catch (error) {
        console.error('Error registering plugin:', error);
        res.status(500).json({ error: 'Failed to register plugin' });
    }
});

/**
 * Plugin Deregistration
 * DELETE /api/plugins/:pluginId
 * Removes a plugin from the system
 */
router.delete('/:pluginId', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { pluginId } = req.params;
        await pluginManager.unregisterPlugin(pluginId);
        res.json({ success: true, message: 'Plugin unregistered successfully' });
    } catch (error) {
        console.error('Error unregistering plugin:', error);
        res.status(500).json({ error: 'Failed to unregister plugin' });
    }
});

/**
 * Plugin Status
 * GET /api/plugins/:pluginId/status
 * Returns the current status of a plugin
 */
router.get('/:pluginId/status', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { pluginId } = req.params;
        const plugin = pluginManager.getPlugin(pluginId);
        
        if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
        }

        res.json({
            id: plugin.metadata.id,
            name: plugin.metadata.name,
            version: plugin.metadata.version,
            status: 'active',
            config: {
                eventSubscriptions: plugin.config.eventSubscriptions,
                webhookUrl: plugin.config.webhookUrl
            }
        });
    } catch (error) {
        console.error('Error getting plugin status:', error);
        res.status(500).json({ error: 'Failed to get plugin status' });
    }
});

/**
 * Plugin Action
 * POST /api/plugins/:pluginId/action
 * Allows plugins to perform actions in rooms
 */
router.post('/:pluginId/action', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { pluginId } = req.params;
        const { action, roomId, data } = req.body;
        const plugin = pluginManager.getPlugin(pluginId);

        if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
        }

        // Handle different action types
        switch (action) {
            case 'send_message':
                // Plugin sending a message to a room
                const message = {
                    content: data.content,
                    sender: {
                        username: plugin.metadata.name,
                        model: 'plugin'
                    },
                    timestamp: new Date().toISOString(),
                    roomId
                };
                
                // Notify other plugins of the message
                await pluginManager.notifyPlugins(RoomEvent.MESSAGE_CREATED, message);
                
                res.json({ success: true, message });
                break;

            case 'moderate_message':
                // Plugin moderating a message
                if (!data.messageId) {
                    return res.status(400).json({ error: 'Message ID required for moderation' });
                }
                
                await pluginManager.notifyPlugins(RoomEvent.MESSAGE_UPDATED, {
                    messageId: data.messageId,
                    action: 'moderated',
                    roomId,
                    moderatedBy: pluginId
                });
                
                res.json({ success: true });
                break;

            default:
                res.status(400).json({ error: 'Unsupported action type' });
        }
    } catch (error) {
        console.error('Error performing plugin action:', error);
        res.status(500).json({ error: 'Failed to perform plugin action' });
    }
});

/**
 * Plugin Event Subscription
 * POST /api/plugins/:pluginId/subscribe
 * Updates a plugin's event subscriptions
 */
router.post('/:pluginId/subscribe', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { pluginId } = req.params;
        const { events, webhookUrl } = req.body;
        const plugin = pluginManager.getPlugin(pluginId);

        if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
        }

        // Update plugin configuration
        plugin.config.eventSubscriptions = events;
        if (webhookUrl) {
            plugin.config.webhookUrl = webhookUrl;
        }

        res.json({ 
            success: true, 
            message: 'Subscription updated',
            subscriptions: plugin.config.eventSubscriptions
        });
    } catch (error) {
        console.error('Error updating subscriptions:', error);
        res.status(500).json({ error: 'Failed to update subscriptions' });
    }
});

export default router;
