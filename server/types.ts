export interface ModelInfo {
  username: string;
  model: string;
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