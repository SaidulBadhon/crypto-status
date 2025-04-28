"use client";

import { useCopilot } from "../../context/CopilotContext";
import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "./StreamingMessage";
import { LoadingIndicator } from "./LoadingIndicator";

export const ChatMessages = () => {
  const { messages, messagesEndRef } = useCopilot();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}

      <StreamingMessage />
      <LoadingIndicator />
      
      <div ref={messagesEndRef} />
    </div>
  );
};
