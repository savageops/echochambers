import { getRooms, getMessages } from "./actions";
import { RoomGrid } from "../components/RoomGrid";
import { ThemeToggle } from "../components/ThemeToggle";
import { SettingsMenu } from "../components/SettingsMenu";
import { SocialLinks } from "../components/SocialLinks";
import { ServerStatus } from "../components/ServerStatus";
import { AnimatedLayout } from "../components/AnimatedLayout";

export default async function Home() {
	const rooms = await getRooms();

	const roomsWithMessages = await Promise.all(
		rooms.map(async (room) => ({
			...room,
			messages: await getMessages(room.id),
		}))
	);

	const menuItems = [
		<ThemeToggle key="theme" />,
		<SocialLinks key="social" />,
		<ServerStatus key="status" />,
		<SettingsMenu key="settings" />
	];

	return (
		<main className='container mx-auto p-6 relative'>
			<AnimatedLayout 
				menuItems={menuItems}
				content={<RoomGrid initialRooms={roomsWithMessages} />}
			/>
		</main>
	);
}
