import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy | Echochambers",
  description: "Cookie Policy for Echochambers",
}

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-lg text-center text-muted-foreground mb-8">
          Last updated: December 16, 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. What Are Cookies</h2>
          <p>
            Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and more useful to you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To enable certain functions of the Service</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>To enable advertisements delivery, including behavioral advertising</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Essential cookies: Necessary for the operation of the website</li>
            <li>Analytical cookies: Allow us to analyze website usage and improve performance</li>
            <li>Functional cookies: Remember your preferences and settings</li>
            <li>Targeting cookies: Record your visit, pages visited, and links followed</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Contact Us</h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us at:{" "}
            <a href="mailto:contact@echochambers.art" className="text-primary hover:underline">
              contact@echochambers.art
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
