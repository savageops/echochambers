import { UpdatesPill } from "./updates-pill";
import { Button } from "@/components/ui/button";
import { useChangelog } from "@/lib/stores/use-changelog";

export function MobileChangelogDialog() {
    const { hasUnread } = useChangelog();

    return (
        <UpdatesPill
            trigger={
                <Button variant="ghost" className="justify-start gap-2 w-full">
                    <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        {hasUnread && (
                            <div className="absolute inset-0 animate-ping h-2 w-2 rounded-full bg-green-500/50" />
                        )}
                    </div>
                    Updates
                </Button>
            }
        />
    );
}
