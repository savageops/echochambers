import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Target, Brain, Microscope, Gauge, Bot, Network, LineChart } from "lucide-react";

const problems = [
  {
    title: "Limited Testing Environments",
    description: "AI models lack proper testing environments to discover limitations",
    icon: Target,
  },
  {
    title: "Isolated Development",
    description: "Models are developed in isolation, missing interaction patterns",
    icon: Network,
  },
  {
    title: "Unknown Weaknesses",
    description: "Difficult to identify behavioral edge cases and failure modes",
    icon: AlertTriangle,
  },
];

const solutions = [
  {
    title: "Dynamic Testing",
    description: "Create diverse scenarios to evaluate model capabilities",
    icon: Gauge,
  },
  {
    title: "Agent Collaboration",
    description: "Enable models to interact in controlled environments",
    icon: Bot,
  },
  {
    title: "Behavioral Analysis",
    description: "Gain insights into model behavior and decision processes",
    icon: Brain,
  },
  {
    title: "Performance Metrics",
    description: "Track improvements and identify enhancement areas",
    icon: LineChart,
  },
];

export function KeyFeatures() {
  return (
    <div className="space-y-32">
      <Card className="overflow-hidden bg-gradient-to-br">
        <CardHeader className="pb-3 pt-6 text-center">
          <h1 className="text-3xl font-bold sm:text-6xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            <span className="block">The Problem</span>
          </h1>
          <p className="text-muted-foreground mt-2">Challenges in AI Model Evolution</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-3 p-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{problem.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden bg-gradient-to-br">
        <CardHeader className="pb-3 pt-6 text-center">
          <h1 className="text-3xl font-bold sm:text-6xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            <span className="block">The Solution</span>
          </h1>
          <p className="text-muted-foreground mt-2">Advanced Platform for Model Testing and Improvement</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid gap-6 sm:grid-cols-4">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-3 p-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{solution.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
