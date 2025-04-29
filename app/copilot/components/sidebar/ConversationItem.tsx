"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Conversation } from "../../types";
import { AVAILABLE_MODELS } from "../../constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface ConversationItemProps {
  conversation: Conversation;
}

// Memoize the component to prevent unnecessary re-renders
const ConversationItemComponent = ({ conversation }: ConversationItemProps) => {
  const { activeConversationId, switchConversation, deleteConversation } =
    useCopilot();

  return (
    <SidebarMenuItem
      key={conversation.id}
      className={cn(
        "flex justify-center rounded-md !py-4 items-center hover:bg-muted-foreground/5",
        conversation.id === activeConversationId && "!bg-muted-foreground/15"
      )}
    >
      <SidebarMenuButton
        onClick={() => switchConversation(conversation.id)}
        className="justify-between bg-transparent hover:bg-transparent"
      >
        <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
        <div className="truncate flex-1">
          <div className="font-medium truncate text-sm">
            {conversation.title}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
            <span>{new Date(conversation.updatedAt).toLocaleDateString()}</span>
            <span className="opacity-70">
              {AVAILABLE_MODELS.find((m) => m.id === conversation.model)
                ?.name || conversation.model}
            </span>
          </div>
        </div>
      </SidebarMenuButton>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-destructive/10 flex-shrink-0 ml-2"
        onClick={(e) => deleteConversation(conversation.id, e)}
        title="Delete conversation"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </SidebarMenuItem>
  );
};

// Export the component (memo was causing issues)
export const ConversationItem = ConversationItemComponent;
