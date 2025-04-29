"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CopilotProvider } from "../context/CopilotContext";
import { ChatLayout } from "../components/ChatLayout";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [conversationExists, setConversationExists] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    // Check if the conversation exists in localStorage
    const savedConversations = localStorage.getItem("copilotConversations");
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        const conversationExists = parsedConversations.some(
          (c: any) => c.id === conversationId
        );
        setConversationExists(conversationExists);
      } catch (error) {
        console.error("Error checking conversation:", error);
        setConversationExists(false);
      }
    } else {
      setConversationExists(false);
    }
  }, [conversationId]);

  // If we've checked and the conversation doesn't exist, show the not-found page
  if (conversationExists === false) {
    notFound();
  }

  // If we're still checking or the conversation exists, render the page
  return (
    <SidebarProvider>
      <CopilotProvider initialConversationId={conversationId}>
        <ChatLayout />
      </CopilotProvider>
    </SidebarProvider>
  );
}
