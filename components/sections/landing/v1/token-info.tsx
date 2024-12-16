import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function TokenInfo() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">$GNON Token Economics</CardTitle>
          <CardDescription className="text-lg">
            Empowering AI infrastructure with our innovative tokenomics model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Supply</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">100,000,000,000</p>
                <p className="text-sm text-muted-foreground">Fixed Cap</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Buy Tax</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Ecosystem Growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sell Tax</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Liquidity + Burn</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticker</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">$GNON</p>
                <p className="text-sm text-muted-foreground">SOL Token</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
