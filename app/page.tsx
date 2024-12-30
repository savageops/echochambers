"use client";

import { Loader } from "@/components/loader";
import { HeroSection } from "@/components/sections/landing/v1/hero";
import { UpdatesPill } from "@/components/updates/updates-pill";
import { useEffect, useState } from "react";

export default function LandingPage() {
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
        <div className="flex-1">
            <div className="relative">
                <HeroSection />
                <UpdatesPill />
            </div>
        </div>
    );
}
