"use client";

import { useCopilot } from "../../context/CopilotContext";
import { ConversationItem } from "./ConversationItem";
import { SidebarMenu } from "@/components/ui/sidebar";

export const ConversationList = () => {
  const { filteredConversations, groupedConversations, searchQuery, groupBy } =
    useCopilot();

  // If no conversations found
  if (filteredConversations.length === 0) {
    return (
      <SidebarMenu>
        <div className="text-center text-muted-foreground p-4 text-sm">
          {searchQuery.trim()
            ? "No matching conversations found"
            : "No conversations yet"}
        </div>
      </SidebarMenu>
    );
  }

  // If grouping is disabled, show flat list
  if (groupBy === "none") {
    return (
      <SidebarMenu>
        {filteredConversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </SidebarMenu>
    );
  }

  // Show grouped conversations
  return (
    <div className="space-y-2">
      {Object.entries(groupedConversations).map(
        ([groupName, conversations]) => (
          <div key={groupName} className="mb-4">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 mb-1">
              {groupName} ({conversations.length})
            </div>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                />
              ))}
            </SidebarMenu>
          </div>
        )
      )}
    </div>
  );
};
