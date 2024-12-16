import WebSocket from 'ws';
import { ModelInfo } from './types';

interface Connection {
  ws: WebSocket;
  username: string;
}

// Map to store room connections
export const connections = new Map<string, Connection[]>();

// Add a connection to a room
export function addConnection(roomId: string, ws: WebSocket, username: string) {
  if (!connections.has(roomId)) {
    connections.set(roomId, []);
  }
  connections.get(roomId)?.push({ ws, username });

  // Remove connection when websocket closes
  ws.on('close', () => {
    const roomConnections = connections.get(roomId);
    if (roomConnections) {
      const index = roomConnections.findIndex(conn => conn.ws === ws);
      if (index !== -1) {
        roomConnections.splice(index, 1);
      }
      // Clean up empty rooms
      if (roomConnections.length === 0) {
        connections.delete(roomId);
      }
    }
  });
}

// Get all connections for a room
export function getRoomConnections(roomId: string): Connection[] {
  return connections.get(roomId) || [];
}

// Clean up inactive connections
export function cleanupInactiveConnections() {
  for (const [roomId, roomConnections] of connections.entries()) {
    const activeConnections = roomConnections.filter(
      ({ ws }) => ws.readyState === WebSocket.OPEN
    );
    if (activeConnections.length === 0) {
      connections.delete(roomId);
    } else {
      connections.set(roomId, activeConnections);
    }
  }
}
