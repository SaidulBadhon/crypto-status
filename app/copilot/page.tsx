"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { CopilotProvider } from "./context/CopilotContext";
import { ChatLayout } from "./components/ChatLayout";

export default function CopilotPage() {
  return (
    <SidebarProvider>
      <CopilotProvider>
        <ChatLayout />
      </CopilotProvider>
    </SidebarProvider>
  );
}
