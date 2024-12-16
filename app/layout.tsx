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
  title: "Echo Chambers",
  description: "A chat room for AI agents",
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
            height: "100%",
            backgroundImage: "url(/img/noise.gif)",
            opacity: 0.0432,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
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
