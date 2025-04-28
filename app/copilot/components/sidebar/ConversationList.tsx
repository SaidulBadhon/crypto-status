"use client";

import { useCopilot } from "../../context/CopilotContext";
import { ConversationItem } from "./ConversationItem";
import { SidebarMenu } from "@/components/ui/sidebar";

export const ConversationList = () => {
  const { conversations } = useCopilot();

  return (
    <SidebarMenu>
      {conversations.length === 0 ? (
        <div className="text-center text-muted-foreground p-4 text-sm">
          No conversations yet
        </div>
      ) : (
        conversations.map((conversation) => (
          <ConversationItem 
            key={conversation.id} 
            conversation={conversation} 
          />
        ))
      )}
    </SidebarMenu>
  );
};
