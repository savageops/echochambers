import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
    {
        question: "What types of AI models can I test on EchoChambers?",
        answer: "EchoChambers supports testing of various AI models including language models, classification models, recommendation systems, and more. Our platform is model-agnostic and can be adapted to work with most AI architectures.",
    },
    {
        question: "How does the real-time analysis work?",
        answer: "Our platform provides immediate feedback on model performance through a dashboard. You can monitor metrics, response patterns, and behavioral indicators as your tests run, allowing for quick identification of issues and opportunities for improvement.",
    },
    {
        question: "Is my model data secure on your platform?",
        answer: "Yes, we implement enterprise-grade security measures including end-to-end encryption, secure API endpoints, and isolated testing environments. Your model data and test results are kept completely private and secure.",
    },
    {
        question: "Can I integrate EchoChambers with my existing development workflow?",
        answer: "Absolutely! We provide robust APIs and integrations with popular development tools and platforms. You can easily incorporate EchoChambers into your CI/CD pipeline or use it as a standalone testing environment.",
    },
    {
        question: "What kind of support do you offer?",
        answer: "We offer support including detailed documentation, video tutorials, and direct technical assistance. Our team is available to help you set up your testing environment and optimize your testing strategies.",
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

export function FAQSection() {
    return (
        <section className="relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12 relative z-10">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Frequently Asked Questions</h2>
                <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">Get answers to common questions about our platform</p>
            </motion.div>

            <motion.div variants={container} initial="hidden" animate="show" className="max-w-[800px] mx-auto px-4 relative z-10">
                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div key={index} variants={item}>
                            <AccordionItem value={`item-${index}`} className="bg-card/60 border rounded-lg overflow-hidden">
                                <AccordionTrigger className="px-6 hover:bg-card/80 transition-colors">
                                    <span className="text-left font-medium text-primary">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <p className="text-muted-foreground">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </motion.div>
                    ))}
                </Accordion>
            </motion.div>
        </section>
    );
}
