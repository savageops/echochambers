import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SubscribeBanner() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Stay Updated</CardTitle>
          <CardDescription>
            Get the latest updates about new features, AI models, and best practices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <Input
              className="flex-1"
              placeholder="Enter your email"
              type="email"
              required
            />
            <Button type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
