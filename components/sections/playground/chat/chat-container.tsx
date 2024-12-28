"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatArea } from "./chat-area";

export function ChatContainer() {
    const { state, sendMessage, setUserInput, clearChat } = useChat();

    return (
        <ChatArea
            messages={state.messages}
            userInput={state.userInput}
            isLoading={state.isLoading}
            processingStep={state.processingStep}
            onUserInputChange={setUserInput}
            onSend={sendMessage}
            clearChat={clearChat}
        />
    );
}
