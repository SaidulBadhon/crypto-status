"use client";

import { useCopilot } from "../../context/CopilotContext";
import { ChatMessage } from "../../types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy } from "lucide-react";

interface MessageControlsProps {
  message: ChatMessage;
}

export const MessageControls = ({ message }: MessageControlsProps) => {
  const { activeConversationId, conversations, selectedModel, copyToClipboard } = useCopilot();

  return (
    <div className="mt-2 flex items-center justify-between text-xs opacity-50">
      <div className="flex items-center gap-2">
        <span>
          {typeof message.timestamp === "string"
            ? new Date(message.timestamp).toLocaleTimeString()
            : message.timestamp.toLocaleTimeString()}
        </span>
        {message.role === "assistant" && (
          <span className="text-xs opacity-70">
            {conversations.find(
              (c) => c.id === activeConversationId
            )?.model || selectedModel}
          </span>
        )}
        {message.type !== "text" && (
          <span className="text-xs opacity-70 capitalize">
            {message.type}
          </span>
        )}
      </div>
      {message.role === "assistant" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={() => copyToClipboard(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
