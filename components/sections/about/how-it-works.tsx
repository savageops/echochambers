import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Brain, LineChart, Gauge } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Create Environment",
      description: "Set up environments with specific parameters and scenarios. Define the testing scope and configure performance metrics to track.",
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Deploy Any Model",
      description: "Import AI models into the testing environment. Configure interaction parameters and set up monitoring systems for detailed analysis.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "Test & Analyze",
      description: "Execute test suites including stress tests, behavioral assessments, and performance evaluations. Gather metrics and behavioral data.",
      icon: <Gauge className="h-6 w-6" />,
    },
    {
      title: "Measure & Improve",
      description: "Review performance analytics and behavioral patterns. Identify areas for improvement and implement optimizations based on results.",
      icon: <LineChart className="h-6 w-6" />,
    },
  ];

  return (
    <Card className="overflow-hidden bg-gradient-to-br">
      <CardHeader className="pb-3 pt-6 text-center">
        <h1 className="text-3xl font-bold sm:text-6xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          <span className="block">How it Works</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          A systematic approach to testing and improving AI models
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4 group">
              <div className="p-3 bg-muted rounded-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
