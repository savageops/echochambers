"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Loader } from "@/components/loader";
import { useState, useEffect } from "react";

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if the content is hydrated
        if (typeof window !== "undefined") {
            // Use requestIdleCallback for better performance
            const checkHydration = () => {
                setIsLoading(false);
            };

            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(checkHydration);
            } else {
                // Fallback for browsers that don't support requestIdleCallback
                setTimeout(checkHydration, 0);
            }
        }
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
        </div>
    );
}
