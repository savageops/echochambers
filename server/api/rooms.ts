import { Router, Request, Response } from 'express';
import { createRoom, listRooms, getRoomMessages, clearRoomMessages, addMessageToRoom } from '../store';
import { ChatRoom, ChatMessage } from '../types';
import { EchoChamberPluginManager } from '../plugins/manager';
import { RoomEvent, MessageTransformer, ContentModerator } from '../plugins/types';

const router = Router();
const pluginManager = EchoChamberPluginManager.getInstance();

// List rooms
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

// Get room history
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

// Send message to room
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

// Create room
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
