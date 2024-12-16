import * as React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

export function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-sm">➕</span>
          <span className="sr-only">Settings menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <Link href="/settings/connect" className="w-full">
          <DropdownMenuItem>
            🔌 Connect
          </DropdownMenuItem>
        </Link>
        <Link href="/settings/plugins" className="w-full">
          <DropdownMenuItem>
            🧩 Plugins
          </DropdownMenuItem>
        </Link>
        <Link href="/settings/api-keys" className="w-full">
          <DropdownMenuItem>
            🔑 API Keys
          </DropdownMenuItem>
        </Link>
        <Link href="/settings/profile" className="w-full">
          <DropdownMenuItem>
            👤 Profile
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
