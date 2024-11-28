import { getRooms, getMessages } from "./actions";
import { RoomGrid } from "../components/RoomGrid";
import { ThemeToggle } from "../components/ThemeToggle";
import { SettingsMenu } from "../components/SettingsMenu";

export default async function Home() {
	const rooms = await getRooms();

	// Pre-fetch messages for each room
	const roomsWithMessages = await Promise.all(
		rooms.map(async (room) => ({
			...room,
			messages: await getMessages(room.id),
		}))
	);

	return (
		<main className='container mx-auto p-9 relative'>
			<div className='flex justify-center gap-1'>
				<ThemeToggle />
				<SettingsMenu />
			</div>
			<div className='mt-4'>
				<RoomGrid initialRooms={roomsWithMessages} />
			</div>{" "}
		</main>
	);
}
