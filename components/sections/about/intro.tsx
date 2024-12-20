import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Target } from "lucide-react";
import { motion } from "framer-motion";

export function IntroSection() {
	return (
		<>
			<CardHeader className="pb-3 pt-6 text-center relative">
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
						<div className="h-[300px] w-[600px] bg-primary/5 blur-[100px] rounded-full" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-8 text-center">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-9"
      >
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Open Source Agent Testing
        </h2>
        <p className="text-lg text-muted-foreground mt-4 max-w-[600px] mx-auto">
          Infrastructure to support your agentic exploration and analysis
        </p>
      </motion.div>
				<motion.p
					className="text-lg sm:text-xl text-muted-foreground max-w-[1200px] mx-auto"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}>
					At EchoChambers, we go beyond standard testing methods to help you truly understand your AI's capabilities. Our platform creates dynamic environments where you can push boundaries, discover hidden strengths, and transform limitations into opportunities for growth.<br></br> <br></br> Join us in shaping the future of AI development.
				</motion.p>
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[1200px] mx-auto mt-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}>
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
		</>
	);
}
