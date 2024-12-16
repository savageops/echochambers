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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function AboutPage() {
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-32 py-12">
          {/* Introduction */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="pt-24">
            <IntroSection />
          </motion.div>

          {/* Features */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <FeaturesSection />
          </motion.div>

          {/* Key Features */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl blur-3xl -z-10" />
            <KeyFeatures />
          </motion.div>

          {/* How It Works */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative">
            <HowItWorks />
          </motion.div>

          {/* Team Section */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-3xl blur-3xl -z-10" />
            <TeamSection />
          </motion.div>

          {/* FAQ Section - Let it handle its own animations */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-background/5 rounded-3xl -z-10" />
            <FAQSection />
          </div>

          {/* Get Started */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/5 rounded-3xl blur-3xl -z-10" />
            <GetStarted />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
