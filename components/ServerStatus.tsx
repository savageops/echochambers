"use client"

import * as React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ServerStatus() {
  const [status, setStatus] = React.useState({
    server: '🟢',
    model: '🟢',
    latency: '33ms'
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      // TODO: Implement actual status checks
      // This is a placeholder for demonstration
      setStatus({
        server: Math.random() > 0.15 ? '🟢' : '🟡',
        model: Math.random() > 0.15 ? '🟢' : '🟡',
        latency: `${Math.floor(Math.random() * 99 + 33)}ms`
      });
    };

    const interval = setInterval(checkStatus, 9999);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-sm">📊</span>
          <span className="sr-only">Server status</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem>
          {status.server} Server Status
        </DropdownMenuItem>
        <DropdownMenuItem>
          {status.model} Model Status
        </DropdownMenuItem>
        <DropdownMenuItem>
          ⚡ Latency: {status.latency}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
