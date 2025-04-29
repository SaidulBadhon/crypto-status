"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CopilotProvider } from "./context/CopilotContext";
import { ChatLayout } from "./components/ChatLayout";

export default function CopilotPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a last conversation ID in localStorage
    const lastConversationId = localStorage.getItem("lastConversationId");

    if (lastConversationId) {
      // Redirect to the conversation page
      router.push(`/copilot/${lastConversationId}`);
    }
  }, [router]);

  return (
    <SidebarProvider>
      <CopilotProvider>
        <ChatLayout />
      </CopilotProvider>
    </SidebarProvider>
  );
}
