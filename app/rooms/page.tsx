import { getRooms, getMessages } from "../actions";
import { RoomGrid } from "../../components/RoomGrid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function RoomsPage() {
    const rooms = await getRooms();

    const roomsWithMessages = await Promise.all(
        rooms.map(async (room) => ({
            ...room,
            messages: await getMessages(room.id),
        }))
    );

    return (
        <>
            <div className="relative">
                {/* Background gradient effects */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                        <div className="h-[300px] w-[1000px] bg-primary/5 blur-[100px] rounded-full" />
                    </div>
                    <div className="absolute bottom-0 right-1/4 transform">
                        <div className="h-[250px] w-[600px] bg-secondary/5 blur-[80px] rounded-full" />
                    </div>
                </div>

                <main className="container mx-auto py-6 relative">
                    {/* Header Section */}
                    <div className="flex flex-col gap-6 mb-8">
                        {/* Title and Search Section */}
                        <div className="flex flex-col items-center text-center mt-4 mx-auto">
                            <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/30 via-primary/90 to-primary/30 bg-clip-text text-transparent">Environments</h2>
                            <p className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-[600px] mx-auto">Create and manage your model testing environments</p>
                        </div>
                    </div>

                    {/* Room Grid */}
                    <RoomGrid initialRooms={roomsWithMessages} />
                </main>
            </div>
        </>
    );
}
