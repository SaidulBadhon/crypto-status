"use client";

import { useCopilot } from "../../context/CopilotContext";
import MarkdownRenderer from "@/components/copilot/MarkdownRenderer";
import { Bot } from "lucide-react";

export const StreamingMessage = () => {
  const { streamingContent, activeConversationId, conversations, selectedModel } = useCopilot();

  if (!streamingContent) return null;

  return (
    <div className="flex justify-start">
      <div className="relative flex max-w-[85%] bg-muted rounded-lg p-4 shadow-sm">
        <div className="mr-3 mt-0.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <MarkdownRenderer content={streamingContent} />
          <div className="mt-2 flex items-center justify-between text-xs opacity-50">
            <div className="flex items-center gap-2">
              <span>{new Date().toLocaleTimeString()}</span>
              <span className="text-xs opacity-70">
                {conversations.find(
                  (c) => c.id === activeConversationId
                )?.model || selectedModel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
