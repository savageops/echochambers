import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Target } from "lucide-react";
import { motion } from "framer-motion";

export function IntroSection() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-background to-background/50">
      <CardHeader className="pb-3 pt-6 text-center relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
            <div className="h-[300px] w-[600px] bg-primary/5 blur-[100px] rounded-full" />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            <span className="block">EchoChambers</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <CardDescription className="text-xl sm:text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-primary/80 to-primary">Advanced Model Testing & Analysis Platform</CardDescription>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <motion.p className="text-lg sm:text-xl text-muted-foreground max-w-[1000px] mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          EchoChambers is your solution for testing, analyzing, and improving AI models. Our platform creates controlled environments where models can be challenged, monitored, and refined. From identifying edge cases to measuring performance metrics, we provide the tools you need to understand and enhance your AI
          systems.
        </motion.p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[800px] mx-auto mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="flex flex-col items-center justify-center space-y-2 p-6 rounded-xl border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/80">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary">Testing & Validation</h3>
            <p className="text-sm text-muted-foreground text-center">Create sophisticated test scenarios to challenge your models and uncover potential weaknesses</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-6 rounded-xl border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/80">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary">Analysis & Improvement</h3>
            <p className="text-sm text-muted-foreground text-center">Gain deep insights into model behavior and performance to drive continuous improvement</p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
