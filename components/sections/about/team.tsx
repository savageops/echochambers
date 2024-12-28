import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users2, Briefcase } from "lucide-react";

const teamMembers = [
    {
        title: "Lead System Architect",
        dox_id: "https://x.com/gnononsolana",
        dox_name: "Dev",
        description: "Former IBM lead engineer and core Linux kernel contributor. Expert in complex systems architecture and distributed computing environments.",
        expertise: "Systems Architecture",
    },
    {
        title: "Chief Technology Officer",
        dox_id: "https://x.com/cryppocrates",
        dox_name: "Doc",
        description: "Physician and technology innovator. Strategic leader and angel investor with a proven track record of scaling technologies.",
        expertise: "Strategic Leadership",
    },
    {
        title: "Tech/Market Mechanics",
        dox_id: "https://x.com/undacappn",
        dox_name: "Moose",
        description: "Full Stack Developer with 30+ years experience architecting systems. Specializes in DEX architecture and liquidity protocols.",
        expertise: "Market Mechanics",
    },
    {
        title: "AI Integration Specialist",
        dox_id: "https://x.com/gnononsolana",
        dox_name: "Sherpa",
        description: "Professional AI expert specializing in advanced agent systems and prompt engineering. Pioneering new approaches to AI behavior.",
        expertise: "AI Systems",
    },
    {
        title: "System Architect",
        dox_id: "https://x.com/savageapi",
        dox_name: "Savage",
        description: "20+ years Full Stack Developer, DevOps and Zero Trust architect. Security specialist with expertise in IoT and automation.",
        expertise: "CyberSec/DevOps",
    },
    {
        title: "Infrastructure Specialist",
        dox_id: "https://x.com/davidsidol",
        dox_name: "DI",
        description: "Hardware systems expert managing industrial scale computing and power resources. Specialized in deployment and scaling.",
        expertise: "Infrastructure",
    },
    {
        title: "Systems/AI Specialist",
        dox_id: "https://x.com/gnononsolana",
        dox_name: "Anita",
        description: "Senior developer specializing in AI systems integration and distributed computing. Versatile technical expert across multiple domains.",
        expertise: "AI Integrations",
    },
    {
        title: "Lead Dev Specialist",
        dox_id: "https://x.com/gnononsolana",
        dox_name: "Aeon",
        description: "Elite agile unit working directly with Lead Architect, combining expertise in systems engineering, AI, and blockchain architecture.",
        expertise: "Development",
    },
];

export function TeamSection() {
    return (
        <>
            <CardHeader className="pb-3 pt-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-l from-primary/5 via-primary/90 to-primary/5 bg-clip-text text-transparent">The Team</h2>
                    <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-[600px] mx-auto">100+ Years Combined Experience</p>
                </motion.div>
                <p className="text-muted-foreground max-w-5xl mx-auto mt-6 text-base sm:text-lg">Built by industry veterans with deep expertise across AI, systems engineering, blockchain, and enterprise development. Our team combines decades of experience from leading tech companies.</p>
            </CardHeader>
            <CardContent className="p-1 py-8">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {teamMembers.map((member, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm transition-colors hover:bg-muted/50 h-full">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative p-6">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Briefcase className="h-5 w-5 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium text-primary">{member.expertise}</p>
                                        </div>
                                        <h3 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors">{member.title}</h3>
                                        <a href={member.dox_id} className="text-sm text-primary/80 hover:text-primary transition-colors mt-2 inline-block relative z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                            {member.dox_name}
                                        </a>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center">
                                        <p className="text-sm text-muted-foreground leading-relaxed text-center">{member.description}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </>
    );
}
