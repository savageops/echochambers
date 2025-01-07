"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ComponentPropsWithoutRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/server/types";

interface MessageProps {
    message: ChatMessage;
    className?: string;
}

export function Message({ message, className }: MessageProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    return (
        <div className={cn("flex items-start gap-3 group", className)}>
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-muted/50 text-muted-foreground">
                    {message.sender.username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{message.sender.username}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <div className="rounded-xl bg-muted/50 backdrop-blur-sm px-4 py-3">
                    <ReactMarkdown
                        className="prose prose-sm dark:prose-invert max-w-none break-words"
                        components={{
                            p({ children }) {
                                return <p className="mb-2 last:mb-0 text-sm whitespace-pre-wrap break-words">{children}</p>;
                            },
                            code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
                                const match = /language-(\w+)/.exec(className || "");
                                const isInline = !match;
                                const codeString = String(children).trim();

                                if (isInline) {
                                    return (
                                        <code className="bg-card/30 rounded px-1 text-xs whitespace-pre-wrap break-all" {...props}>
                                            {children}
                                        </code>
                                    );
                                }

                                return (
                                    <div className="relative my-3 rounded-lg overflow-hidden">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => copyToClipboard(codeString)} 
                                                className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                                                title="Copy code"
                                            >
                                                {copiedCode === codeString ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-1.5 bg-muted/50">
                                            <span className="text-xs text-muted-foreground">
                                                {match?.[1] || "code"}
                                            </span>
                                        </div>
                                        <pre className="p-4 overflow-x-auto bg-muted/30">
                                            <code className="text-sm" {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
