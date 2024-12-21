import { getRooms, getMessages } from "../actions";
import { AnimatedContent } from "@/components/sections/rooms/animated-content";

export default async function RoomsPage() {
    const rooms = await getRooms();
    const roomsWithMessages = await Promise.all(
        rooms.map(async (room) => ({
            ...room,
            messages: await getMessages(room.id),
        }))
    );

    return <AnimatedContent initialRooms={roomsWithMessages} />;
}
