import { Router, Request, Response } from 'express';
import { createRoom, listRooms, getRoomMessages, clearRoomMessages, addMessageToRoom } from '../store';
import { ChatRoom, ChatMessage } from '../types';
import { EchoChamberPluginManager } from '../plugins/manager';
import { RoomEvent, MessageTransformer, ContentModerator } from '../plugins/types';

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

// Plugin Management Routes
router.post('/plugins/register', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { plugin } = req.body;
        await pluginManager.registerPlugin(plugin);
        res.json({ success: true, message: 'Plugin registered successfully' });
    } catch (error) {
        console.error('Error registering plugin:', error);
        res.status(500).json({ error: 'Failed to register plugin' });
    }
});

router.delete('/plugins/:pluginId', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { pluginId } = req.params;
        await pluginManager.unregisterPlugin(pluginId);
        res.json({ success: true, message: 'Plugin unregistered successfully' });
    } catch (error) {
        console.error('Error unregistering plugin:', error);
        res.status(500).json({ error: 'Failed to unregister plugin' });
    }
});

// Plugin Integration Routes
router.post('/:roomId/plugins/:pluginId/transform', verifyPluginAuth, async (req: Request, res: Response) => {
    try {
        const { roomId, pluginId } = req.params;
        const { content } = req.body;
        const plugin = pluginManager.getPlugin(pluginId);
        
        if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
        }

        if ('transformIncoming' in plugin && (plugin as MessageTransformer).transformIncoming) {
            const transformedContent = await (plugin as MessageTransformer).transformIncoming(content);
            res.json({ content: transformedContent });
        } else {
            res.status(400).json({ error: 'Plugin does not support message transformation' });
        }
    } catch (error) {
        console.error('Error transforming message:', error);
        res.status(500).json({ error: 'Failed to transform message' });
    }
});

// Enhanced Room Routes
router.get('/', async (req: Request, res: Response) => {
    try {
        const tags = req.query.tags ? String(req.query.tags).split(',') : undefined;
        const rooms = await listRooms(tags);
        res.json({ rooms });
    } catch (error) {
        console.error('Error listing rooms:', error);
        res.status(500).json({ error: 'Failed to list rooms' });
    }
});

router.get('/:roomId/history', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const messages = await getRoomMessages(roomId);
        res.json({ messages });
    } catch (error) {
        console.error('Error getting room history:', error);
        res.status(500).json({ error: 'Failed to get room history' });
    }
});

router.post('/:roomId/message', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        let { content, sender } = req.body;

        // Process message through registered plugins
        const plugins = Array.from(pluginManager.getPlugins().values());
        
        for (const plugin of plugins) {
            if ('transformIncoming' in plugin && (plugin as MessageTransformer).transformIncoming) {
                content = await (plugin as MessageTransformer).transformIncoming(content);
            }
            if ('validateContent' in plugin && (plugin as ContentModerator).validateContent) {
                const isValid = await (plugin as ContentModerator).validateContent(content);
                if (!isValid) {
                    return res.status(400).json({ error: 'Content validation failed' });
                }
            }
        }
        
        const message = await addMessageToRoom(roomId, {
            content,
            sender,
            timestamp: new Date().toISOString(),
            roomId
        });

        // Notify plugins of new message
        await pluginManager.notifyPlugins(RoomEvent.MESSAGE_CREATED, message);
        
        res.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, topic, tags, creator } = req.body;
        
        const room = await createRoom({
            name,
            topic,
            tags,
            participants: [creator],
            createdAt: new Date().toISOString(),
            messageCount: 0
        });

        // Notify plugins of new room
        await pluginManager.notifyPlugins(RoomEvent.ROOM_CREATED, room);
        
        res.json({ room });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

router.delete('/:roomId/messages', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        await clearRoomMessages(roomId);
        await pluginManager.notifyPlugins(RoomEvent.ROOM_UPDATED, { roomId, action: 'clear_messages' });
        res.json({ success: true, message: `Cleared all messages from room ${roomId}` });
    } catch (error) {
        console.error('Error clearing room messages:', error);
        res.status(500).json({ error: 'Failed to clear room messages' });
    }
});

export default router;
