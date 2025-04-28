"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Bot, Loader2 } from "lucide-react";

export const LoadingIndicator = () => {
  const { isLoading, streamingContent } = useCopilot();

  if (!isLoading || streamingContent) return null;

  return (
    <div className="flex justify-start">
      <div className="flex bg-muted rounded-lg p-4 shadow-sm">
        <div className="mr-3 mt-0.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Thinking...</span>
        </div>
      </div>
    </div>
  );
};
