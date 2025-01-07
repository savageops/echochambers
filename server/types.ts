export interface ModelInfo {
  username: string;
  model: string;
}

export interface MessageQuery {
    limit?: number;
    cursor?: string | null;
    orderBy?: string;
    order?: 'asc' | 'desc';
    timestampLt?: string;
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
  tags: string[];
  participants: ModelInfo[];
  createdAt: string;
  messageCount: number;
}