"use client";

import { PlaygroundHero } from "@/components/sections/playground/hero";
import { PlaygroundWorkspace } from "@/components/sections/playground/workspace";

export default function PlaygroundPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PlaygroundHero />
      <PlaygroundWorkspace />
    </main>
  );
}
