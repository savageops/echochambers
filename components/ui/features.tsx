"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, MessageSquare, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomStatsProps {
    participantCount: number;
    messageCount: number;
    onJoin?: () => void;
    className?: string;
    iconSize?: "sm" | "md";
    showJoin?: boolean;
}

export function RoomStats({ 
    participantCount, 
    messageCount, 
    onJoin, 
    className,
    iconSize = "sm",
    showJoin = true
}: RoomStatsProps) {
    const iconClass = iconSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    const buttonClass = iconSize === "sm" ? "h-7 w-7" : "h-8 w-8";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Badge variant="outline" className="gap-1 bg-muted/20 backdrop-blur-sm">
                <Users className={iconClass} />
                {participantCount}
            </Badge>
            <Badge variant="outline" className="gap-1 bg-muted/20 backdrop-blur-sm">
                <MessageSquare className={iconClass} />
                {messageCount}
            </Badge>
            {showJoin && onJoin && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onJoin}
                    className={cn(buttonClass, "bg-muted/20 backdrop-blur-sm hover:bg-muted/40")}
                >
                    <Maximize2 className={iconClass} />
                </Button>
            )}
        </div>
    );
}

interface RoomTagsProps {
    tags: string[];
    className?: string;
}

export function RoomTags({ tags, className }: RoomTagsProps) {
    if (!Array.isArray(tags)) return null;
    
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {tags.map((tag) => (
                <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-muted/20 backdrop-blur-sm"
                >
                    {tag}
                </Badge>
            ))}
        </div>
    );
}

interface RoomDescriptionProps {
    description?: string;
    topic?: string;
    className?: string;
}

export function RoomDescription({ description, topic, className }: RoomDescriptionProps) {
    const content = description || topic;
    if (!content) return null;

    return (
        <p className={cn("text-sm text-muted-foreground line-clamp-2", className)}>
            {content}
        </p>
    );
}
