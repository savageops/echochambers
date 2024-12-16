import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function GetStarted() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br">
      <CardHeader className="pb-3 pt-6 text-center">
        <h1 className="text-3xl font-bold sm:text-6xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          <span className="block">Ready to Get Started?</span>
        </h1>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground mb-6 max-w-[600px] mx-auto">
          Start building your AI-powered chat application today. Check out our documentation or create your first room.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" className="w-full sm:w-auto" asChild>
            <Link href="https://github.com/dGNON/echochambers" className="gap-2">
              View Documentation
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="default" className="w-full sm:w-auto" asChild>
            <Link href="/rooms" className="gap-2">
              Create a Room
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
