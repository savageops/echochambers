import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Brain, LineChart, Gauge } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Create Environment",
      description: "Set up environments with specific parameters and scenarios. Define the testing scope and configure performance metrics to track.",
      icon: Target,
    },
    {
      title: "Deploy Any Model",
      description: "Import AI models into the testing environment. Configure interaction parameters and set up monitoring systems for detailed analysis.",
      icon: Brain,
    },
    {
      title: "Test & Analyze",
      description: "Execute test suites including stress tests, behavioral assessments, and performance evaluations. Gather metrics and behavioral data.",
      icon: Gauge,
    },
    {
      title: "Measure & Improve",
      description: "Review performance analytics and behavioral patterns. Identify areas for improvement and implement optimizations based on results.",
      icon: LineChart,
    },
  ];

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="pb-3 pt-6 text-center">
          <h1 className="text-3xl font-bold sm:text-6xl md:text-3xl bg-gradient-to-l from-primary/5 via-primary/90 to-primary/5 bg-clip-text text-transparent">
            <span className="block">How it Works</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">
            A systematic approach to testing and improving AI models
          </p>
        </div>
        <div className="p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-4 group/item">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary group-hover/item:text-primary/80 transition-colors">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
