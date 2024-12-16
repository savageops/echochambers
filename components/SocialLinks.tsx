'use client';

import * as React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function SocialLinks() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-sm">🌐</span>
          <span className="sr-only">Social links</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => window.open('https://x.com', '_blank')}>
           𝕏  Twitter
        </DropdownMenuItem>        <DropdownMenuItem onClick={() => window.open('https://t.me', '_blank')}>
          📬 Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open('https://github.com', '_blank')}>
          🐙 GitHub
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open('https://discord.com', '_blank')}>
          💬 Discord
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
