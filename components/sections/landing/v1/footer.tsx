import Link from "next/link"
import { Icons } from "@/components/icons"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-center">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About GNON</h3>
            <p className="text-sm text-muted-foreground max-w-[222px] mx-auto">
              Building the future of AI infrastructure with decentralized solutions.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="https://x.com/GnonOnSolana" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://t.me/numogramsolana" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.telegram className="h-5 w-5" />
                <span className="sr-only">Telegram</span>
              </Link>
              <Link href="https://github.com/dGNON/echochambers" className="text-muted-foreground hover:text-primary transition-colors">
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://dgnon.ai" className="text-muted-foreground hover:text-primary transition-colors">
                  Mother Project
                </Link>
              </li>
              <li>
                <Link href="https://github.com/dGNON/echochambers" className="text-muted-foreground hover:text-primary transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://linktr.ee/numogram_GNON" className="text-muted-foreground hover:text-primary transition-colors">
                  Linktree
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://github.com/dGNON/echochambers/blob/main/README.md" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="https://github.com/dGNON/echochambers/blob/main/README.md" className="text-muted-foreground hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="mailto:contact@echochambers.art" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} GNON. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
