import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function GetStarted() {
    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/5 via-primary/90 to-primary/5 bg-clip-text text-transparent">Ready to Get Started?</h2>
                    <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">Start building your AI-powered chat application today. Check out our documentation or create your first room.</p>
                </motion.div>
            <CardContent className="p-8 text-center">
                <div className="flex flex-col justify-center gap-4">
                    <Button variant="default" className="w-[222px] mx-auto" asChild>
                        <Link href="https://github.com/dGNON/echochambers" className="gap-2">
                            View Documentation
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="default" className="w-[180px] mx-auto" asChild>
                        <Link href="/rooms" className="gap-2">
                            Create a Room
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </>
    );
}
