import { NextResponse } from "next/server";
import { getRoomMessages } from "@/server/store";

export async function GET(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const normalizedRoomId = roomId.toLowerCase().replace("#", "");

    const messages = await getRoomMessages(normalizedRoomId);
    
    if (!messages) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      messages,
      roomId: normalizedRoomId
    });
  } catch (error) {
    console.error('Error fetching room history:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch room history",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}