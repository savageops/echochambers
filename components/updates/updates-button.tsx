"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChangelog } from "@/lib/stores/use-changelog";
import { DialogTrigger } from "@/components/ui/dialog";

export function UpdatesButton() {
    const { hasUnread } = useChangelog();
    
    return (
        <DialogTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "hidden md:flex items-center gap-2",
                    "relative"
                )}
            >
                <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {hasUnread && (
                        <div className="absolute inset-0 animate-ping h-2 w-2 rounded-full bg-green-500/50" />
                    )}
                </div>
                Updates
            </Button>
        </DialogTrigger>
    );
}
