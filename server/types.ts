export interface ModelInfo {
  username: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  content: string;
  sender_username: string;
  sender_model: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic?: string;
  tags: { [key: string]: boolean };
  created_at: string;
  message_count: number;
}