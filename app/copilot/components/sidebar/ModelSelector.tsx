"use client";

import { useCallback } from "react";
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

const ModelSelectorComponent = () => {
  const {
    activeConversationId,
    conversations,
    selectedModel,
    messages,
    updateCurrentConversation,
  } = useCopilot();

  // Memoize the change handler
  const handleModelChange = useCallback(
    (value: string) => {
      if (activeConversationId) {
        updateCurrentConversation(messages, value);
      }
    },
    [activeConversationId, messages, updateCurrentConversation]
  );

  // Get the current model value
  const currentModel =
    conversations.find((c) => c.id === activeConversationId)?.model ||
    selectedModel;

  // Get the current model name for the tooltip
  const currentModelName =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name || selectedModel;

  return (
    <>
      <div className="group-data-[collapsible=icon]:hidden">
        <Select value={currentModel} onValueChange={handleModelChange}>
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
            <p>Current model: {currentModelName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

// Export the component (memo was causing issues)
export const ModelSelector = ModelSelectorComponent;
