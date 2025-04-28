"use client";

import { useCopilot } from "../../context/CopilotContext";
import { ImagePreview } from "./ImagePreview";
import { AudioPreview } from "./AudioPreview";
import { RecordingIndicator } from "./RecordingIndicator";
import { InputTypeSelector } from "./InputTypeSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

export const ChatInput = () => {
  const { 
    handleSubmit, 
    input, 
    setInput, 
    isLoading, 
    selectedInputType, 
    selectedImage, 
    audioBlob,
    fileInputRef,
    handleImageChange
  } = useCopilot();

  return (
    <div className="border-t border-border py-3 px-4 flex-shrink-0 bg-background">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Hidden file input for image uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        <ImagePreview />
        <AudioPreview />
        <RecordingIndicator />

        <div className="flex gap-2">
          {/* Text input */}
          {selectedInputType === "text" && (
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crypto markets..."
              disabled={isLoading}
              className="flex-1 py-5"
            />
          )}

          {/* Input type selectors */}
          <InputTypeSelector />

          {/* Send button */}
          <Button
            type="submit"
            disabled={
              isLoading ||
              (selectedInputType === "text" && !input.trim()) ||
              (selectedInputType === "image" && !selectedImage) ||
              (selectedInputType === "audio" && !audioBlob)
            }
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            <span>Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
