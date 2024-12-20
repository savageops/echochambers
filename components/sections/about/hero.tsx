"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Brain, Target, LineChart, Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function HeroSection() {
	return (
		<section className="relative flex py-12 min-h-screen justify-center overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
			{/* Decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-1/2 left-1/2 -translate-x-1/2 transform">
					<div className="h-[400px] w-[800px] bg-primary/10 blur-[100px] rounded-full" />
				</div>
			</div>

			{/* Background Elements */}
			<div className="absolute inset-0">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
					className="absolute top-0 left-1/2 -translate-x-1/2 transform">
					<div className="h-[500px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
				</motion.div>
			</div>

			<div className="container relative mx-auto px-4 py-12 text-center">
				{/* New Feature Badge */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}>
					<Badge
						className="mb-8 inline-flex"
						variant="outline">
						<Sparkles className="mr-2 h-3 w-3" /> Advanced Agent Testing & Analysis
					</Badge>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl mb-6">
					<span className="bg-gradient-to-br from-primary/30 via-primary/90 to-primary/30 bg-clip-text text-transparent">Evolve Your AI Models Through Dynamic Testing</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mx-auto max-w-[1100px] text-muted-foreground text-lg sm:text-xl mb-10">
					Design immersive test scenarios that push your AI agents and LLMs to their limits. <br></br>From basic interaction patterns to complex decision trees, Echo Chambers helps you understand model behavior, detect prompt engineering gaps, and iteratively enhance capabilities.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="flex flex-col sm:flex-row justify-center gap-4 mb-12 w-full max-w-[450px] mx-auto">
					<Button
						size="lg"
						className="w-full sm:w-auto group bg-primary hover:bg-primary/90"
						asChild>
						<Link
							href="/rooms"
							className="gap-2">
							Start Testing
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Link>
					</Button>
				</motion.div>

				{/* Highlights */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:max-w-[444px] lg:max-w-[1100px] mx-auto mt-8">
					{[
						{ icon: Brain, text: "Advanced Testing" },
						{ icon: Target, text: "Precise Analysis" },
						{ icon: LineChart, text: "Performance Metrics" },
						{ icon: Gauge, text: "Real-time Results" },
					].map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
							className="flex flex-col lg:flex-row items-center sm:justify-center gap-3 rounded-xl border bg-card/70 backdrop-blur-sm p-5 transition-colors hover:bg-card">
							<div className="rounded-lg bg-primary/10 p-2.5">
								<item.icon className="h-5 w-5 text-primary" />
							</div>
							<span className="font-medium text-center sm:text-left">{item.text}</span>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
