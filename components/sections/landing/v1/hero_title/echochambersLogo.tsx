"use client";

import { Word } from "./Word";
import { LogoPaths } from "./paths";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function EchochambersLogo() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = theme === "system" ? systemTheme : theme;
    const logoColor = currentTheme === "dark" ? "currentColor" : "#000000";

    return (
        <div className="flex justify-center items-center w-full overflow-visible">
            <svg viewBox="-0 -12 1000 111" className="w-full max-w-[1400px] h-auto overflow-visible">
                <g>
                    <Word paths={LogoPaths.echo} color={logoColor} baseDelay={0} />
                </g>
                <g>
                    <Word paths={LogoPaths.chambers} color={logoColor} baseDelay={0.6} />
                </g>
                <rect x="945" y="66" width="54" height="9" fill={!mounted ? "#ffffff48" : currentTheme === "dark" ? "#ffffff48" : "#00000048"} className="animate-[blink_1s_infinite]">
                    <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </rect>
            </svg>
        </div>
    );
}
