"use client";

import { useRef, useEffect } from "react";
import { useCopilot } from "../../context/CopilotContext";
import { ConversationItem } from "./ConversationItem";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useVirtualization } from "@/lib/hooks/useVirtualization";

const ConversationListComponent = () => {
  const { filteredConversations, groupedConversations, searchQuery, groupBy } =
    useCopilot();

  // Set up virtualization for the flat list
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 72; // Approximate height of each conversation item

  const { virtualItems, totalHeight } = useVirtualization(
    filteredConversations,
    {
      itemHeight: ITEM_HEIGHT,
      overscan: 5,
      containerHeight: 500, // This will be adjusted by the container's actual height
    }
  );

  // Update container height when the component mounts
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        // Update the container height in the virtualization hook
        // This would require modifying the hook to accept dynamic height changes
      });

      resizeObserver.observe(containerRef.current);
      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, []);

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

  // If grouping is disabled, show virtualized flat list
  if (groupBy === "none") {
    return (
      <div
        ref={containerRef}
        className="overflow-auto max-h-[500px] relative"
        style={{ height: "500px" }}
      >
        <div style={{ height: `${totalHeight}px`, position: "relative" }}>
          {virtualItems.map(({ index, item: conversation }) => (
            <div
              key={conversation.id}
              style={{
                position: "absolute",
                top: index * ITEM_HEIGHT,
                width: "100%",
                height: ITEM_HEIGHT,
              }}
            >
              <ConversationItem conversation={conversation} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show grouped conversations with virtualization for each group
  return (
    <div className="space-y-2">
      {Object.entries(groupedConversations).map(
        ([groupName, conversations]) => {
          // Set up virtualization for each group
          const { virtualItems, totalHeight } = useVirtualization(
            conversations,
            {
              itemHeight: ITEM_HEIGHT,
              overscan: 3,
              containerHeight: Math.min(
                300,
                conversations.length * ITEM_HEIGHT
              ), // Limit height for each group
            }
          );

          return (
            <div key={groupName} className="mb-4">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 mb-1">
                {groupName} ({conversations.length})
              </div>
              <div
                className="overflow-auto relative"
                style={{
                  height: `${Math.min(
                    300,
                    conversations.length * ITEM_HEIGHT
                  )}px`,
                  maxHeight: "300px",
                }}
              >
                <div
                  style={{ height: `${totalHeight}px`, position: "relative" }}
                >
                  {virtualItems.map(({ index, item: conversation }) => (
                    <div
                      key={conversation.id}
                      style={{
                        position: "absolute",
                        top: index * ITEM_HEIGHT,
                        width: "100%",
                        height: ITEM_HEIGHT,
                      }}
                    >
                      <ConversationItem conversation={conversation} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

// Export the component (memo was causing issues)
export const ConversationList = ConversationListComponent;
