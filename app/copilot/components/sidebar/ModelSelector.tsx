"use client";

import { useCopilot } from "../../context/CopilotContext";
import { AVAILABLE_MODELS } from "../../constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle } from "lucide-react";

export const ModelSelector = () => {
  const { 
    activeConversationId, 
    conversations, 
    selectedModel, 
    messages,
    updateCurrentConversation 
  } = useCopilot();

  return (
    <>
      <div className="group-data-[collapsible=icon]:hidden">
        <Select
          value={
            conversations.find((c) => c.id === activeConversationId)
              ?.model || selectedModel
          }
          onValueChange={(value: string) => {
            if (activeConversationId) {
              // Update the current conversation with the new model
              updateCurrentConversation(messages, value);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2 cursor-pointer hover:bg-muted rounded-md">
              <PlusCircle className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>
              Current model:{" "}
              {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                ?.name || selectedModel}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
