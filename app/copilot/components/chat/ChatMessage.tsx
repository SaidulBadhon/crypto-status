"use client";

import { ChatMessage as ChatMessageType } from "../../types";
import { MessageContent } from "./MessageContent";
import { MessageControls } from "./MessageControls";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative flex max-w-[85%] ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        } rounded-lg p-4 shadow-sm`}
      >
        <div className="mr-3 mt-0.5 flex-shrink-0">
          {message.role === "user" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <User className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <MessageContent message={message} />
          <MessageControls message={message} />
        </div>
      </div>
    </div>
  );
};
