"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const AudioPreview = () => {
  const { selectedInputType, audioUrl, handleAudioRemove } = useCopilot();

  if (selectedInputType !== "audio" || !audioUrl) return null;

  return (
    <div className="relative w-full rounded-md overflow-hidden border border-border p-2">
      <audio src={audioUrl} controls className="w-full" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 rounded-full"
        onClick={handleAudioRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
