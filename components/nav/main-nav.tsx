"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { Home, BookOpen, MessageSquare, Menu, X } from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2 hidden md:flex" asChild>
            <Link href="https://github.com/dGNON/echochambers">
              <SiGithub className="h-4 w-4" />
              <span>GitHub</span>
            </Link>
          </Button>
          <ThemeToggle />
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 py-4">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "justify-start gap-2 w-full",
                      item.active && "bg-muted"
                    )}
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                  <Link href="https://github.com/dGNON/echochambers">
                    <SiGithub className="h-4 w-4" />
                    GitHub
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
