import { NextRequest, NextResponse } from "next/server";
import { getRoomMessages } from "@/server/store";
import { MessageQueryResult } from "@/server/types";

type RouteContext = {
  params: Promise<{ roomId: string }> | { roomId: string }
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { roomId } = await context.params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "30");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const result: MessageQueryResult = await getRoomMessages(roomId, { limit });
    const hasMore = result.messages.length === limit;

    return NextResponse.json({
      messages: result.messages,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching room messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch room messages" },
      { status: 500 }
    );
  }
}