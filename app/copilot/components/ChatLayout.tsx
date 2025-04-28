"use client";

import { ConversationSidebar } from "./sidebar/ConversationSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./input/ChatInput";
import { ImageGenerationDialog } from "./dialog/ImageGenerationDialog";

export const ChatLayout = () => {
  return (
    <>
      <ImageGenerationDialog />
      
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar for conversation history */}
        <ConversationSidebar />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <ChatHeader />
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatMessages />
            <ChatInput />
          </div>
        </div>
      </div>
    </>
  );
};
