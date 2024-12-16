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

				<main className='container mx-auto p-6 relative'>
					{/* Header Section */}
					<div className="flex flex-col gap-6 mb-8">
						{/* Title and Search Section */}
						<div className="flex flex-col items-center text-center gap-3 mx-auto">
							<h1 className="text-3xl font-bold">Environments</h1>
							<p className="text-muted-foreground max-w-md">
								Create and manage your model testing environments
							</p>
						</div>
					</div>

					{/* Room Grid */}
					<RoomGrid initialRooms={roomsWithMessages} />
				</main>
			</div>
		</>
	);
}
