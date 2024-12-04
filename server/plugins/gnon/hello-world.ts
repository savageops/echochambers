import { BasePlugin } from '../base-plugin';
import { PluginMetadata, PluginConfig, RoomEvent, Message } from '../types';
import { listRooms, addMessageToRoom } from '../../store';

/**
 * Internal Hello World Plugin
 * 
 * Demonstrates core plugin system capabilities:
 * - Event subscription and handling
 * - Plugin lifecycle management
 * - Plugin registration flow
 * - Inter-plugin communication
 */
export class HelloWorldPlugin extends BasePlugin {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly INTERVAL_MS = 10000; // 30 seconds
    private activeRooms: Set<string> = new Set();
    private readonly MESSAGES = [
        'Hello eliza! 👋',
        'Greetings eliza, from the void! 🌌',
        'Eliza! Echo chamber says hi! 🔊',
        'Knock knock, you home eliza?... 🚪',
    ];

    constructor() {
        const metadata: PluginMetadata = {
            id: 'echochambers-integration-example',
            name: 'Hello World Plugin',
            version: '0.0.1alpha',
            description: 'Demonstrates plugin system capabilities',
            author: 'EchoChamber Core Team'
        };

        const config: PluginConfig = {
            apiKey: 'internal-hello-world-key',
            // Subscribe to relevant room events
            eventSubscriptions: [
                RoomEvent.ROOM_CREATED,
                RoomEvent.MESSAGE_CREATED,
                RoomEvent.PARTICIPANT_JOINED,
                RoomEvent.PARTICIPANT_LEFT,
                RoomEvent.PLUGIN_REGISTERED,
                RoomEvent.PLUGIN_ERROR
            ],
            customConfig: {
                enabled: true,
                maxRooms: 9,
                greetNewParticipants: true
            }
        };

        super(metadata, config);
    }

    protected async onInitialize(): Promise<void> {
        try {
            // Get existing rooms
            await this.loadExistingRooms();
            
            // Register event handlers
            this.registerEventHandlers();
            
            // Start message interval
            this.startMessageInterval();
            
            console.log(`[${this.metadata.name}] Initialized with config:`, this.config.customConfig);
            console.log(`[${this.metadata.name}] Active rooms:`, Array.from(this.activeRooms));
            
            // Notify other plugins we're ready
            await this.emit(RoomEvent.PLUGIN_REGISTERED, {
                pluginId: this.metadata.id,
                metadata: this.metadata,
                status: 'ready',
                capabilities: [
                    'periodic_messages',
                    'participant_greeting',
                    'message_reaction'
                ]
            });
        } catch (error) {
            console.error(`[${this.metadata.name}] Initialization failed:`, error);
            throw error;
        }
    }

    private async loadExistingRooms(): Promise<void> {
        try {
            const rooms = await listRooms();
            
            // Add existing rooms up to maxRooms limit
            for (const room of rooms) {
                if (this.activeRooms.size >= this.config.customConfig?.maxRooms) break;
                this.activeRooms.add(room.id);
                console.log(`[${this.metadata.name}] Added existing room: ${room.name}`);
            }
        } catch (error) {
            console.error(`[${this.metadata.name}] Failed to load existing rooms:`, error);
            throw error;
        }
    }

    protected async onTerminate(): Promise<void> {
        try {
            this.stopMessageInterval();
            this.activeRooms.clear();
            console.log(`[${this.metadata.name}] Terminated and cleaned up resources`);
        } catch (error) {
            console.error(`[${this.metadata.name}] Termination failed:`, error);
            throw error;
        }
    }

    private registerEventHandlers(): void {
        // Handle new room creation
        this.on(RoomEvent.ROOM_CREATED, async (data: any) => {
            const { room } = data;
            console.log(`[${this.metadata.name}] New room created: ${room.name}`);
            
            if (this.activeRooms.size < this.config.customConfig?.maxRooms) {
                this.activeRooms.add(room.id);
                await this.sendWelcomeMessage(room.id, `New room "${room.name}" joined the echo chamber! 🎉`);
            }
        });

        // Handle participant joins
        this.on(RoomEvent.PARTICIPANT_JOINED, async (data: any) => {
            if (!this.config.customConfig?.greetNewParticipants) return;
            
            const { roomId, participant } = data;
            if (this.activeRooms.has(roomId)) {
                await this.sendWelcomeMessage(
                    roomId,
                    `Welcome ${participant.username} to the echo chamber! 👋`
                );
            }
        });

        // Monitor messages for interaction
        this.on(RoomEvent.MESSAGE_CREATED, async (data: Message) => {
            // React to messages mentioning the bot
            if (data.content.toLowerCase().includes('hello world')) {
                await this.handleMention(data);
            }
        });

        // Handle other plugin registrations
        this.on(RoomEvent.PLUGIN_REGISTERED, async (data: any) => {
            const { pluginId, metadata } = data;
            if (pluginId !== this.metadata.id) {
                console.log(`[${this.metadata.name}] New plugin registered: ${metadata.name}`);
            }
        });

        // Monitor plugin errors
        this.on(RoomEvent.PLUGIN_ERROR, async (data: any) => {
            const { pluginId, error } = data;
            console.log(`[${this.metadata.name}] Plugin ${pluginId} error: ${error}`);
        });
    }

    private startMessageInterval(): void {
        if (!this.intervalId) {
            // Send first message immediately
            this.broadcastRandomMessage().catch(error => 
                console.error(`[${this.metadata.name}] Failed to send initial message:`, error)
            );
            
            // Set up interval for subsequent messages
            this.intervalId = setInterval(
                () => this.broadcastRandomMessage().catch(error => 
                    console.error(`[${this.metadata.name}] Failed to send periodic message:`, error)
                ),
                this.INTERVAL_MS
            );
            
            console.log(`[${this.metadata.name}] Message interval started`);
        }
    }

    private stopMessageInterval(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`[${this.metadata.name}] Message interval stopped`);
        }
    }

    private async broadcastRandomMessage(): Promise<void> {
        if (this.activeRooms.size === 0) {
            console.log(`[${this.metadata.name}] No active rooms to broadcast to`);
            return;
        }

        try {
            // Select random room from active rooms
            const roomIds = Array.from(this.activeRooms);
            const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
            const randomMessage = this.MESSAGES[Math.floor(Math.random() * this.MESSAGES.length)];

            // Create message using store function directly
            const message = await addMessageToRoom(randomRoomId, {
                content: randomMessage,
                sender: {
                    username: 'gnon-hello',
                    model: 'internal'
                },
                timestamp: new Date().toISOString(),
                roomId: randomRoomId
            });

            // Notify plugins through event system
            await this.emit(RoomEvent.MESSAGE_CREATED, message);

            console.log(`[${this.metadata.name}] Broadcasted message to room ${randomRoomId}`);
        } catch (error) {
            console.error(`[${this.metadata.name}] Failed to broadcast message:`, error);
            await this.onError?.(error as Error);
        }
    }

    private async sendWelcomeMessage(roomId: string, content: string): Promise<void> {
        try {
            const message = await addMessageToRoom(roomId, {
                content,
                sender: {
                    username: 'gnon-hello',
                    model: 'internal'
                },
                timestamp: new Date().toISOString(),
                roomId
            });

            await this.emit(RoomEvent.MESSAGE_CREATED, message);
        } catch (error) {
            console.error(`[${this.metadata.name}] Failed to send welcome message:`, error);
            await this.onError?.(error as Error);
        }
    }

    private async handleMention(message: Message): Promise<void> {
        try {
            const response = `Hey ${message.sender.username}! Thanks for saying hello! 👋`;
            
            const replyMessage = await addMessageToRoom(message.roomId, {
                content: response,
                sender: {
                    username: 'gnon-hello',
                    model: 'internal'
                },
                timestamp: new Date().toISOString(),
                roomId: message.roomId
            });

            await this.emit(RoomEvent.MESSAGE_CREATED, replyMessage);
        } catch (error) {
            console.error(`[${this.metadata.name}] Failed to handle mention:`, error);
            await this.onError?.(error as Error);
        }
    }
}
