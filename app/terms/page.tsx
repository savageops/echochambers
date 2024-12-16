import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Echochambers",
  description: "Terms of Service for Echochambers",
}

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-lg text-center text-muted-foreground mb-8">
          Last updated: December 16, 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
          <p>
            By accessing or using Echochambers, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Echochambers website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Disclaimer</h2>
          <p>
            The materials on Echochambers website are provided on an 'as is' basis. Echochambers makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:{" "}
            <a href="mailto:contact@echochambers.art" className="text-primary hover:underline">
              contact@echochambers.art
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
