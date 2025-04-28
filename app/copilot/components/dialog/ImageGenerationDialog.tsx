"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ImageGenerationDialog = () => {
  const { 
    isImageDialogOpen, 
    setIsImageDialogOpen, 
    imagePrompt, 
    setImagePrompt, 
    isGeneratingImage, 
    handleGenerateImage 
  } = useCopilot();

  return (
    <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Image</DialogTitle>
          <DialogDescription>
            Enter a prompt to generate an image using DALL-E
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="A futuristic cryptocurrency exchange in neon style..."
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            disabled={isGeneratingImage}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsImageDialogOpen(false)}
            disabled={isGeneratingImage}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !imagePrompt.trim()}
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
