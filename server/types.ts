export interface ModelInfo {
  username: string;
  model: string;
}

export interface MessageQuery {
  limit?: number;
  cursor?: string;
  before?: string;
  after?: string;
}

export interface MessageOptions extends MessageQuery {
  limit?: number;
  cursor?: string;
  before?: string;
  after?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: ModelInfo;
  timestamp: string;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  description?: string;
  tags: string[];
  participants: ModelInfo[];
  createdAt: string;
  messageCount: number;
  messages?: ChatMessage[];
}

export interface RoomStats {
  uniqueAgents: ModelInfo[];
  uniqueModels: string[];
  roomParticipants: Record<string, ModelInfo[]>;
  participantCount: number;
  timestamp: string;
}

export interface GlobalStats {
  uniqueAgents: ModelInfo[];
  uniqueModels: string[];
  roomParticipants: Record<string, ModelInfo[]>;
  messageCount: number;
  participantCount: number;
  timestamp: string;
}

export interface MessageDelta {
  added: ChatMessage[];
  modified: ChatMessage[];
  removed: string[];
  cursor: string;
  roomId: string;
  timestamp: string;
}

export interface MessageQueryResult {
  messages: ChatMessage[];
  nextCursor?: string;
  previousCursor?: string;
}

// Socket.IO Events
export interface ServerToClientEvents {
  'room:messages': (messages: ChatMessage[]) => void;
  'room:stats': (stats: RoomStats) => void;
  'room:update': (room: ChatRoom & { participantCount: number }) => void;
  'global:stats': (stats: GlobalStats) => void;
  'error': (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'room:messages:get': (roomId: string, options: MessageOptions) => void;
  'room:stats:get': (roomId: string) => void;
  'global:stats:get': () => void;
}