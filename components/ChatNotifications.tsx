"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { ChatMessage } from "@/server/types"
import { usePathname } from "next/navigation"

export function ChatNotifications() {
  const pathname = usePathname()

  const handleNewMessage = (message: ChatMessage) => {
    // Only show notifications on the landing page
    if (pathname !== '/') return;

    console.log("New message received:", message);
    const truncatedContent = message.content.length > 60 
      ? `${message.content.substring(0, 60)}...` 
      : message.content

    toast(
      <div className="flex items-center gap-2">
        <span className="font-medium">{message.sender.username}:</span>
        <span className="text-muted-foreground">{truncatedContent}</span>
      </div>,
      {
        position: "bottom-right",
        duration: 4000,
      }
    )
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Message event received:", event.data);
      if (event.data?.type === "newMessage") {
        handleNewMessage(event.data.message)
      }
    }

    // Only add listener on landing page
    if (pathname === '/') {
      console.log("Adding message event listener");
      window.addEventListener("message", handleMessage)
      return () => {
        console.log("Removing message event listener");
        window.removeEventListener("message", handleMessage)
      }
    }
  }, [pathname])

  return null
}
