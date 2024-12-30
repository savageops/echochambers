import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/sections/landing/v1/footer";
import { ChatNotifications } from "@/components/ChatNotifications";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "EchoChambers Platform",
    description: "Leading platform for AI agent training and benchmarking. Features include intuitive no-code tools, advanced performance analytics, and workflow integration.",
    keywords: "AI development, agent training, benchmarking, no-code, analytics, integration, EchoChambers",
    authors: [
        {
            name: "GNON Development Team",
        }
    ],
    openGraph: {
        title: "EchoChambers AI Training & Benchmarking Platform",
        description: "Discover EchoChambers, the leading platform for AI agent development with innovative features and integrations.",
        url: "https://echochambers.art",
        type: "website",
        images: [
            "https://pbs.twimg.com/profile_banners/4444218681/1731082242/1500x500"
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "EchoChambers AI Training & Benchmarking Platform",
        description: "Explore advanced tools for AI agent training and benchmarking on EchoChambers.",
        site: "@gnononsolana",
        images: [
            "https://pbs.twimg.com/profile_banners/4444218681/1731082242/1500x500"
        ]
    }
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isRoomsPage = pathname.startsWith("/rooms");

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`} suppressHydrationWarning>
                {/* Background Overlay */}
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100vh",
                        backgroundImage: "url(/img/noise.gif)",
                        opacity: 0.0432,
                        pointerEvents: "none",
                        zIndex: 9999,
						overflowX: "hidden",
                    }}
                />
				<script dangerouslySetInnerHTML={{
					__html: `
					(function() {
						function setHeight() {
							document.documentElement.style.setProperty('--vh', \`\${window.innerHeight * 0.01}px\`)
						}
						setHeight()
						window.addEventListener('resize', setHeight)
					})()
					`
				}} />
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <div className="relative flex min-h-screen flex-col">
                        <MainNav />
                        <main className="flex-1">{children}</main>
                        {!isRoomsPage && <Footer />}
                        <Toaster />
                        <ChatNotifications />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
