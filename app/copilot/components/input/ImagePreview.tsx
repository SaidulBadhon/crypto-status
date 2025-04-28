"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const ImagePreview = () => {
  const { selectedInputType, imagePreview, handleImageRemove } = useCopilot();

  if (selectedInputType !== "image" || !imagePreview) return null;

  return (
    <div className="relative w-full rounded-md overflow-hidden border border-border">
      <img
        src={imagePreview}
        alt="Selected image"
        className="max-h-60 w-auto mx-auto"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 rounded-full"
        onClick={handleImageRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
