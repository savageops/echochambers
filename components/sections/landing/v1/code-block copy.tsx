"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const testingCode = `import { TestEnvironment, Model } from 'echochambers-ai'

// Create a test environment
const env = new TestEnvironment({
  name: 'Performance Testing',
  metrics: ['accuracy', 'latency', 'robustness'],
  scenarios: ['edge-cases', 'stress-tests']
})

// Load and test your model
const model = await Model.load('your-model')
const results = await env.runTests({
  model,
  iterations: 1000,
  parallel: true
})

// Analyze results
const analysis = await results.analyze()
console.log('Performance Metrics:', analysis.metrics)
console.log('Behavioral Patterns:', analysis.patterns)
console.log('Improvement Suggestions:', analysis.suggestions)`

const configCode = `{
  "environment": {
    "type": "dynamic",
    "agents": {
      "count": 5,
      "roles": ["user", "expert", "adversary"]
    },
    "scenarios": {
      "complexity": "adaptive",
      "categories": [
        "edge-cases",
        "stress-tests",
        "security-validation"
      ]
    }
  },
  "metrics": {
    "performance": ["accuracy", "latency"],
    "behavior": ["consistency", "bias"],
    "security": ["robustness", "privacy"]
  }
}`

export function CodeBlock() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="rounded-lg bg-card/30 backdrop-blur-sm shadow-xl ring-1 ring-primary/10 overflow-hidden">
      <Tabs defaultValue="test" className="w-full">
        <div className="border-b border-border/40">
          <TabsList className="w-full justify-start rounded-none border-b border-border/40 bg-transparent p-0">
            <TabsTrigger 
              value="test"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Test Runner
            </TabsTrigger>
            <TabsTrigger 
              value="config"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Configuration
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="test" className="p-6 pt-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "h-8 w-8 relative",
                    copied === 'test' && "text-green-500"
                  )}
                  onClick={() => copyToClipboard(testingCode, 'test')}
                >
                  {copied === 'test' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy test code</span>
                </Button>
              </div>
              <pre className="overflow-x-auto p-4 rounded-lg bg-card/60">
                <code className="text-sm text-foreground/90">{testingCode}</code>
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="p-6 pt-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "h-8 w-8 relative",
                    copied === 'config' && "text-green-500"
                  )}
                  onClick={() => copyToClipboard(configCode, 'config')}
                >
                  {copied === 'config' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy configuration</span>
                </Button>
              </div>
              <pre className="overflow-x-auto p-4 rounded-lg bg-card/60">
                <code className="text-sm text-foreground/90">{configCode}</code>
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
