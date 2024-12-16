import Image from "next/image"

export function ContentBlocks() {
  return (
    <section className="container space-y-12 py-8 md:py-12 lg:py-24">
      {/* Innovation Block */}
      <div className="flex flex-col gap-8 md:flex-row items-center">
        <div className="flex-1 space-y-4">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
            Revolutionary AI Infrastructure
          </h2>
          <p className="text-muted-foreground">
            Our cutting-edge infrastructure enables seamless integration of AI models,
            providing unprecedented scalability and performance for your applications.
          </p>
        </div>
        <div className="flex-1 relative h-[300px] w-full">
          <Image
            src="/images/ai-infrastructure.png"
            alt="AI Infrastructure Visualization"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Technology Stack Block */}
      <div className="flex flex-col-reverse gap-8 md:flex-row items-center">
        <div className="flex-1 relative h-[300px] w-full">
          <Image
            src="/images/tech-stack.png"
            alt="Technology Stack"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
            Enterprise-Grade Technology Stack
          </h2>
          <p className="text-muted-foreground">
            Built on robust foundations utilizing state-of-the-art technologies,
            ensuring reliability, security, and optimal performance at scale.
          </p>
        </div>
      </div>

      {/* Banner Section */}
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
        <Image
          src="/images/banner-bg.png"
          alt="Join the AI Revolution"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h3 className="text-3xl font-bold">Join the AI Revolution</h3>
            <p>Be part of the next generation of AI infrastructure</p>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
