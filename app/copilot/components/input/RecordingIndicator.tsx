"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export const RecordingIndicator = () => {
  const { isRecording, stopRecording } = useCopilot();

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-2 text-red-500 animate-pulse">
      <Mic className="h-4 w-4" />
      <span>Recording... Click stop when finished</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={stopRecording}
      >
        Stop
      </Button>
    </div>
  );
};
