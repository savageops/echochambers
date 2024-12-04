import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/settings/connect", icon: "🔌", label: "Connect" },
  { href: "/settings/plugins", icon: "🧩", label: "Plugins" },
  { href: "/settings/api-keys", icon: "🔑", label: "API Keys" },
  { href: "/settings/profile", icon: "👤", label: "Profile" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-3 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
        
        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2">📱</span>
                Settings Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="w-full">
                  <DropdownMenuItem>
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Navigation Sidebar */}
        <Card className="hidden md:block w-48 h-fit p-3 space-y-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </Card>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
