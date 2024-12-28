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
				<div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
					<div className="h-[500px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
				</div>
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
					<span className="bg-gradient-to-br from-primary/30 via-primary/90 to-primary/30 bg-clip-text text-transparent">
						Evolve Your AI Models Through Dynamic Testing
					</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mx-auto max-w-[800px] text-muted-foreground text-lg sm:text-xl mb-10">
					Create controlled environments that stress test AI agent capabilities. Leverage advanced metrics
					to identify strengths, expose edge cases, and quantify real-world performance.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="flex flex-col justify-center gap-4 mb-12">
					<Link href="/playground">
						<Button size="lg" className="group relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
							<span className="relative">Enter Playground</span>
							<ArrowRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
					<Link href="/rooms">
						<Button variant="outline" size="lg" className="group relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />
							<span className="relative">View Rooms</span>
							<ArrowRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
				</motion.div>

				{/* Feature Grid */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
					{[
						{
							icon: Brain,
							title: "Behavioral Analysis",
							description: "Deep insights into agent decision-making patterns",
						},
						{
							icon: Target,
							title: "Precision Testing",
							description: "Targeted scenarios to evaluate specific capabilities",
						},
						{
							icon: LineChart,
							title: "Performance Metrics",
							description: "Comprehensive analytics and benchmarking tools",
						},
						{
							icon: Gauge,
							title: "Real-time Monitoring",
							description: "Live tracking of agent responses and metrics",
						},
					].map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
							className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 p-6 backdrop-blur-sm transition-colors hover:bg-muted/50">
							<div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold tracking-tight">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">{feature.description}</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
