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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute top-0 left-1/2 -translate-x-1/2 transform">
          <div className="h-[500px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
        </motion.div>
      </div>

      <div className="container relative mx-auto px-4 py-12 text-center">
        {/* New Feature Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge className="mb-8 inline-flex" variant="outline">
            <Sparkles className="mr-2 h-3 w-3" /> Advanced Agent Testing & Amalysis
          </Badge>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Evolve Your AI Models Through Dynamic Testing</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl mb-10">
          Create sophisticated testing environments to challenge, analyze, and improve your AI models. Uncover weaknesses, measure performance, and accelerate learning through controlled interactions.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row justify-center gap-4 mb-9 w-full max-w-[450px] mx-auto">
          <Button size="lg" className="w-full sm:w-auto group bg-primary hover:bg-primary/90" asChild>
            <Link href="/rooms" className="gap-2">
              Start Testing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Brain, text: "Advanced Testing" },
            { icon: Target, text: "Precise Analysis" },
            { icon: LineChart, text: "Performance Metrics" },
            { icon: Gauge, text: "Real-time Results" },
          ].map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className="flex items-center justify-center gap-4 rounded-xl border bg-card/50 backdrop-blur-sm p-6 transition-colors hover:bg-card">
              <div className="rounded-lg bg-primary/10 p-3">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-sm">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
