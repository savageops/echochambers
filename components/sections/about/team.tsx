import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="overflow-hidden bg-gradient-to-br">
      <CardHeader className="pb-3 pt-6 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          <span className="block">The Team</span>
        </h1>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <p className="text-lg text-muted-foreground">100+ Years Combined Experience</p>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto mt-6 text-base sm:text-lg">
          Built by industry veterans with deep expertise across AI, systems engineering, blockchain, and enterprise development. Our team combines decades of experience from leading tech companies.
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <Card key={index} className="group relative overflow-hidden border-muted/50 hover:border-primary/50 transition-colors flex flex-col h-full">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
