"use client";

import { useCopilot } from "../../context/CopilotContext";
import { AVAILABLE_MODELS } from "../../constants";
import { WELCOME_MESSAGE } from "../../constants";
import { Button } from "@/components/ui/button";
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
import { Bot, PlusCircle, RefreshCw } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const ChatHeader = () => {
  const {
    activeConversationId,
    conversations,
    selectedModel,
    messages,
    setMessages,
    setStreamingContent,
    updateCurrentConversation,
    createNewConversation,
  } = useCopilot();

  return (
    <header className="border-b border-border py-3 px-6 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Crypto Copilot</h1>
        </div>
        <div className="flex gap-2 items-center">
          {/* Model selector for desktop */}
          <div className="hidden sm:block">
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
              <SelectTrigger className="w-[180px] h-8">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => createNewConversation(selectedModel)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    // Reset current conversation
                    if (activeConversationId) {
                      const resetMessages = [WELCOME_MESSAGE];
                      setMessages(resetMessages);
                      setStreamingContent("");
                      updateCurrentConversation(resetMessages);
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};
