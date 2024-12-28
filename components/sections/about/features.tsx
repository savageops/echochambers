import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, LineChart, Zap, Shield, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Real-time Analysis",
        description: "Monitor model performance and behavior with advanced real-time analytics",
        icon: LineChart,
    },
    {
        title: "Stress Testing",
        description: "Push models to limits with customizable stress tests and edge case scenarios",
        icon: Target,
    },
    {
        title: "Behavioral Analysis",
        description: "Dive deep into model's decision-making process and response patterns",
        icon: Brain,
    },
    {
        title: "Quick Integration",
        description: "Seamlessly integrate models with our platform using our robust API",
        icon: Zap,
    },
    {
        title: "Secure Environment",
        description: "Protect models and data with enterprise-grade security measures",
        icon: Shield,
    },
    {
        title: "Version Control",
        description: "Track changes and improvements across different versions of models",
        icon: GitBranch,
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
    return (
        <section className="relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
                <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/5 via-primary/90 to-primary/5 bg-clip-text text-transparent">Platform Features</h2>
                <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">Everything you need to test, analyze, and improve your AI models</p>
            </motion.div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto px-4">
                {features.map((feature, index) => (
                    <motion.div key={index} variants={item}>
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 p-6 backdrop-blur-sm transition-colors hover:bg-muted/50">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative flex flex-col items-center text-center space-y-4">
                                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-primary">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
