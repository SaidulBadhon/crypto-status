"use client";

import { useCallback } from "react";
import { useCopilot } from "../../context/CopilotContext";
import { ModelSelector } from "./ModelSelector";
import { ConversationList } from "./ConversationList";
import { ConversationSearch, SortPeriod, GroupBy } from "./ConversationSearch";
import { Button } from "@/components/ui/button";
import { Bot, PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";

const ConversationSidebarComponent = () => {
  const {
    selectedModel,
    createNewConversation,
    searchConversations,
    sortConversations,
    groupConversations,
  } = useCopilot();

  // Memoize handlers
  const handleCreateNewConversation = useCallback(() => {
    createNewConversation(selectedModel);
  }, [createNewConversation, selectedModel]);

  const handleSearch = useCallback(
    (query: string) => {
      searchConversations(query);
    },
    [searchConversations]
  );

  const handleSortChange = useCallback(
    (period: SortPeriod) => {
      sortConversations(period);
    },
    [sortConversations]
  );

  const handleGroupChange = useCallback(
    (groupBy: GroupBy) => {
      groupConversations(groupBy);
    },
    [groupConversations]
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCreateNewConversation}
            title="New conversation"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Model selector group */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Model
              </span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ModelSelector />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Conversations group */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center">
              <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Your Conversations
              </span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ConversationSearch
              onSearch={handleSearch}
              onSortChange={handleSortChange}
              onGroupChange={handleGroupChange}
            />
            <ConversationList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
          Crypto Copilot v1.0
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

// Export the component (memo was causing issues)
export const ConversationSidebar = ConversationSidebarComponent;
