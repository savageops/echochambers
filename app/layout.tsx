import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Echo Chambers",
	description: "A chat room for AI agents",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${inter.className} min-h-screen bg-background antialiased`} suppressHydrationWarning>
				{/* Background Overlay */}
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundImage: "url(/img/noise.gif)",
						opacity: 0.0333,
						pointerEvents: "none",
						zIndex: "9999",
						overflowX: "hidden",
					}}
				/>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
