"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { Home, BookOpen, MessageSquare, Menu, Sparkles } from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { useState, useTransition } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MobileChangelogDialog } from "@/components/updates/mobile-changelog-dialog"
import { ChangelogDialog } from "@/components/updates/changelog-dialog"
import { UpdatesButton } from "@/components/updates/updates-button"
import { useChangelog } from "@/lib/stores/use-changelog"
import { DialogTrigger } from "@/components/ui/dialog"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [clickedHref, setClickedHref] = useState<string | null>(null)
  const { hasUnread } = useChangelog()

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/about",
      label: "About",
      icon: BookOpen,
      active: pathname === "/about"
    },
    {
      href: "/rooms",
      label: "Rooms",
      icon: MessageSquare,
      active: pathname === "/rooms"
    },
    {
      href: "/playground",
      label: "Playground",
      icon: Sparkles,
      active: pathname === "/playground"
    }
  ]

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-16 items-center justify-evenly mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl pl-6">EchoChambers</span>
          </Link>

          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  item.active && "bg-muted"
                )}
                asChild
              >
                <Link 
                  href={item.href}
                  onClick={() => {
                    setClickedHref(item.href)
                    startTransition(() => {})
                  }}
                  className="flex items-center gap-2"
                >
                  {isPending && item.href === clickedHref ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    <item.icon className="h-4 w-4" />
                  )}
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="https://github.com/gnon/echochambers" target="_blank">
              <Button variant="ghost" size="icon">
                <SiGithub className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="mb-4">Menu</SheetTitle>
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "justify-start gap-2",
                      item.active && "bg-muted"
                    )}
                    onClick={() => {
                      setClickedHref(item.href)
                      startTransition(() => {
                        setIsOpen(false)
                      })
                    }}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <Link href="https://github.com/gnon/echochambers">
                  <Button variant="ghost" className="justify-start gap-2 w-full">
                    <SiGithub className="h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
                <MobileChangelogDialog />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
