"use client";

import { HeroSection } from "@/components/sections/about/hero";
import { IntroSection } from "@/components/sections/about/intro";
import { KeyFeatures } from "@/components/sections/about/key-features";
import { FeaturesSection } from "@/components/sections/about/features";
import { HowItWorks } from "@/components/sections/about/how-it-works";
import { TeamSection } from "@/components/sections/about/team";
import { FAQSection } from "@/components/sections/about/faq";
import { GetStarted } from "@/components/sections/about/get-started";
import { motion } from "framer-motion";
import { Loader } from "@/components/loader";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if the content is hydrated
        if (typeof window !== "undefined") {
            // Use requestIdleCallback for better performance
            const checkHydration = () => {
                setIsLoading(false);
            };

            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(checkHydration);
            } else {
                // Fallback for browsers that don't support requestIdleCallback
                setTimeout(checkHydration, 0);
            }
        }
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                    <div className="h-[500px] w-[1000px] bg-primary/5 blur-[100px] rounded-full" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="absolute bottom-0 left-1/4 -translate-x-1/2 transform">
                    <div className="h-[300px] w-[600px] bg-secondary/5 blur-[80px] rounded-full" />
                </motion.div>
            </div>

            {/* Hero Section - Full width with gradient overlay */}

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
                <HeroSection />
            </div>

            {/* Main Content - Container with enhanced spacing and animations */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1200px] mx-auto space-y-32 py-12">
                    {/* Introduction */}
                    <div className="pt-9 relative">
                        <div className="absolute inset-0 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-2/4 transform">
                                <div className="h-[300px] w-[900px] bg-primary/5 blur-[150px] rounded-full" />
                            </div>
                        </div>
                        <div className="relative z-20">
                            <IntroSection />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="relative">
                        <div className="absolute inset-0 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-2/4 transform">
                                <div className="h-[300px] w-[900px] bg-primary/5 blur-[150px] rounded-full" />
                            </div>
                        </div>
                        <div className="relative z-20">
                            <FeaturesSection />
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="relative">
                        <div className="absolute inset-0 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3/4 transform">
                                <div className="h-[600px] w-[1200px] bg-primary/5 blur-[222px]" />
                            </div>
                        </div>
                        <div className="relative z-20">
                            <KeyFeatures />
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="relative">
                        <div className="absolute inset-0 z-10"></div>
                        <div className="relative z-20">
                            <HowItWorks />
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="relative">
                        <div className="absolute inset-0 z-10"></div>
                        <div className="relative z-20">
                            <TeamSection />
                        </div>
                    </div>

                    {/* FAQ Section - Let it handle its own animations */}
                    <div className="relative">
                        <div className="absolute inset-0 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3/4 transform">
                                <div className="h-[600px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
                            </div>
                        </div>
                        <div className="relative z-20">
                            <FAQSection />
                        </div>
                    </div>

                    {/* Get Started */}
                    <div className="pb-[42px] relative">
                        {/* <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/5 rounded-3xl blur-[69px] z-10" /> */}
                        <div className="absolute inset-0 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1/4 transform">
                                <div className="h-[600px] w-[1200px] bg-primary/5 blur-[150px] rounded-full" />
                            </div>
                        </div>
                        <div className="relative z-20">
                            <GetStarted />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
