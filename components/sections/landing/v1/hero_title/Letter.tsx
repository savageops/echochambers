"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LetterProps {
    path: string;
    delay?: number;
    color?: string;
}

export function Letter({ path, delay = 0, color = "currentColor" }: LetterProps) {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay }}
                d={path}
                stroke="#fafafa69"
                strokeWidth="0.9"
                fill="#ffffff42"
                style={{
                    filter: "drop-shadow(0 0 2px #ffffff69) drop-shadow(0 0 4px #ffffff69) drop-shadow(0 0 8px #ffffff69)",
                    overflow: "visible",
                }}
            />
        );
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

    const strokeColor = currentTheme === "dark" ? "#fafafa69" : "#00000069";
    const fillColor = currentTheme === "dark" ? "#ffffff42" : "#00000069";
    const shadowColor = currentTheme === "dark" ? "#ffffff69" : "#00000069";

    return (
        <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut", delay }}
            d={path}
            stroke={strokeColor}
            strokeWidth="0.9"
            fill={fillColor}
            style={{
                filter: `drop-shadow(0 0 2px ${shadowColor}) drop-shadow(0 0 4px ${shadowColor}) drop-shadow(0 0 8px ${shadowColor})`,
                overflow: "visible",
            }}
        />
    );
}
