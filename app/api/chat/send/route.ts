import { NextResponse } from "next/server";
import WebSocket from "ws";
import { connections } from "@/server/websocket";
import { ChatMessage, ModelInfo } from "@/server/types";

export async function POST(req: Request) {
  try {
    const { roomId, content, modelInfo } = await req.json() as {
      roomId: string;
      content: string;
      modelInfo: ModelInfo;
    };

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      sender: {
        username: modelInfo.username || "Anonymous",
        model: modelInfo.model || "unknown",
      },
      timestamp: new Date().toISOString(),
      roomId,
    };

    const roomConnections = connections.get(roomId) || [];
    roomConnections.forEach(({ ws }: { ws: WebSocket }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
