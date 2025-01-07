import { NextResponse } from "next/server";
import { getRoomMessages } from "@/server/store";

type RouteContext = {
  params: Promise<{ roomId: string }> | { roomId: string }
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { roomId } = await context.params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const cursor = url.searchParams.get("cursor"); // timestamp of oldest message

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const messages = await getRoomMessages(roomId, { limit, cursor });
    const hasMore = messages.length === limit;
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].timestamp : null;

    return NextResponse.json({
      messages,
      hasMore,
      nextCursor
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}