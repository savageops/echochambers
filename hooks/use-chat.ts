import { useState } from "react";
import { Message } from "@/components/sections/playground/types";
import { sendChatMessage } from "@/lib/chat-service";
import { STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "./use-local-storage";

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    userInput: string;
    processingStep?: {
        number: number;
        name: string;
    };
}

export interface UseChatResult {
    state: ChatState;
    sendMessage: () => Promise<void>;
    setUserInput: (input: string) => void;
    clearChat: () => void;
}

export function useChat(): UseChatResult {
    const [messages, setMessages] = useLocalStorage<Message[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInputState] = useState("");
    const [processingStep, setProcessingStep] = useState<ChatState["processingStep"]>();

    const state: ChatState = {
        messages,
        isLoading,
        userInput,
        processingStep,
    };

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessage: Message = {
            role: "user",
            content: userInput.trim(),
            type: "chat",
        };

        setMessages([...messages, newMessage]);
        setIsLoading(true);
        setUserInputState("");
        setProcessingStep(undefined);

        try {
            const response = await sendChatMessage(userInput.trim(), {
                onStepStart: (stepNumber, stepName) => {
                    setProcessingStep({ number: stepNumber, name: stepName });
                },
                onStepComplete: () => {
                    setProcessingStep(undefined);
                },
            });

            const responseMessage: Message = {
                ...response,
                type: "chat",
            };

            setMessages(prev => [...prev, responseMessage]);
            setIsLoading(false);
            setProcessingStep(undefined);
        } catch (error) {
            console.error("Failed to get chat response:", error);
            setIsLoading(false);
            setProcessingStep(undefined);
            // You might want to show an error message to the user here
        }
    };

    const setUserInput = (input: string) => {
        setUserInputState(input);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return {
        state,
        sendMessage,
        setUserInput,
        clearChat,
    };
}
