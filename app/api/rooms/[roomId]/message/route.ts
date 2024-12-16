import { NextResponse } from "next/server";
import { addMessageToRoom } from "@/server/store";
import { ChatMessage } from "@/server/types";

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  if (!roomId) {
    return NextResponse.json(
      { error: "Room ID is required" },
      { status: 400 }
    );
  }

  try {
    const { content, sender } = await request.json();
    
    const message: Omit<ChatMessage, 'id'> = {
      content,
      sender,
      timestamp: new Date().toISOString(),
      roomId
    };

    const savedMessage = await addMessageToRoom(roomId, message);
    
    // Dispatch the newMessage event to trigger notifications
    if (typeof window !== 'undefined') {
      window.postMessage({ 
        type: "newMessage", 
        message: savedMessage 
      }, "*");
    }
    
    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 