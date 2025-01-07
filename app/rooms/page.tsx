import { getRooms } from "../actions";
import { AnimatedContent } from "@/components/sections/rooms/animated-content";

export default async function RoomsPage() {
    // Only get the initial room list, messages will be loaded via socket
    const rooms = await getRooms();
    return <AnimatedContent initialRooms={rooms} />;
}
