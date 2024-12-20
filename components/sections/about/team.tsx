import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users2, Briefcase } from "lucide-react";

const teamMembers = [
	{
		title: "Lead Systems Architect",
		description: "Former IBM lead engineer and core Linux kernel contributor. Expert in complex systems architecture and distributed computing environments.",
		expertise: "Systems Architecture",
	},
	{
		title: "Chief Technology Officer",
		description: "Physician and technology innovator. Strategic leader and angel investor with a proven track record of scaling technologies.",
		expertise: "Strategic Leadership",
	},
	{
		title: "Technical Lead/Market Mechanics",
		description: "Full Stack Developer with 30+ years experience architecting systems. Specializes in DEX architecture and liquidity protocols.",
		expertise: "Full Stack Development",
	},
	{
		title: "AI Integrations Specialist",
		description: "Professional AI expert specializing in advanced agent systems and prompt engineering. Pioneering new approaches to AI behavior.",
		expertise: "AI Systems",
	},
	{
		title: "System Architect",
		description: "20+ years Full Stack development, DevOps and zero trust architecture. Security specialist with expertise in IoT and automation.",
		expertise: "Security & DevOps",
	},
	{
		title: "Infrastructure Specialist",
		description: "Hardware systems expert managing industrial scale computing and power resources. Specialized in deployment and scaling.",
		expertise: "Infrastructure",
	},
	{
		title: "Systems/AI Specialist",
		description: "Senior developer specializing in AI systems integration and distributed computing. Versatile technical expert across multiple domains.",
		expertise: "AI Integration",
	},
	{
		title: "Lead Development Specialists",
		description: "Elite agile unit working directly with Lead Architect, combining expertise in systems engineering, AI, and blockchain architecture.",
		expertise: "Development",
	},
];

export function TeamSection() {
	return (
		<>
			<CardHeader className="pb-3 pt-6 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-3">
					<h2 className="text-3xl font-bold bg-gradient-to-l from-primary/5 via-primary/90 to-primary/5 bg-clip-text text-transparent">The Team</h2>
					<p className="text-lg text-muted-foreground mt-4 max-w-[600px] mx-auto">100+ Years Combined Experience</p>
				</motion.div>
				<p className="text-muted-foreground max-w-5xl mx-auto mt-6 text-base sm:text-lg">Built by industry veterans with deep expertise across AI, systems engineering, blockchain, and enterprise development. Our team combines decades of experience from leading tech companies.</p>
			</CardHeader>
			<CardContent className="p-8">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{teamMembers.map((member, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}>
							<Card
								className="group relative overflow-hidden border-muted/50 hover:border-primary/50 transition-colors flex flex-col h-full">
								<CardHeader className="pb-3 text-center">
									<div className="flex items-center justify-center space-x-2 mb-3">
										<Briefcase className="h-5 w-5 text-primary" />
										<p className="text-sm font-medium text-primary">{member.expertise}</p>
									</div>
									<CardTitle className="text-lg group-hover:text-primary transition-colors">{member.title}</CardTitle>
								</CardHeader>
								<CardContent className="flex-grow flex items-center justify-center">
									<p className="text-sm text-muted-foreground leading-relaxed text-center">{member.description}</p>
								</CardContent>
								<div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</Card>
						</motion.div>
					))}
				</div>
			</CardContent>{" "}
		</>
	);
}
