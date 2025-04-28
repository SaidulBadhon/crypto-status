"use client";

import { ChatMessage } from "../../types";
import MarkdownRenderer from "@/components/copilot/MarkdownRenderer";

interface MessageContentProps {
  message: ChatMessage;
}

export const MessageContent = ({ message }: MessageContentProps) => {
  if (message.role === "assistant" && message.type === "text") {
    return <MarkdownRenderer content={message.content} />;
  }

  if (message.type === "text") {
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  }

  if (message.type === "image") {
    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.imageUrl && (
          <div className="rounded-md overflow-hidden border border-border">
            <img
              src={message.imageUrl}
              alt="User uploaded image"
              className="max-h-60 w-auto"
            />
          </div>
        )}
      </div>
    );
  }

  if (message.type === "audio") {
    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.audioUrl && (
          <div className="rounded-md overflow-hidden border border-border p-2">
            <audio src={message.audioUrl} controls className="w-full" />
          </div>
        )}
      </div>
    );
  }

  if (message.type === "generated-image") {
    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.imageUrl && (
          <div className="rounded-md overflow-hidden border border-border">
            <img
              src={message.imageUrl}
              alt="AI generated image"
              className="max-h-80 w-auto"
            />
          </div>
        )}
      </div>
    );
  }

  // Default fallback
  return <div className="whitespace-pre-wrap">{message.content}</div>;
};
