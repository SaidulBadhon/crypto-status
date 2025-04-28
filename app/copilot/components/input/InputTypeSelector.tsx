"use client";

import { useCopilot } from "../../context/CopilotContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare, Image, Mic, ImagePlus } from "lucide-react";

export const InputTypeSelector = () => {
  const { 
    selectedInputType, 
    setSelectedInputType, 
    isLoading, 
    isRecording, 
    startRecording, 
    stopRecording, 
    handleImageSelect,
    isGeneratingImage,
    setIsImageDialogOpen
  } = useCopilot();

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedInputType === "text" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={() => setSelectedInputType("text")}
              disabled={isLoading}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Text message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedInputType === "image" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={handleImageSelect}
              disabled={isLoading}
            >
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedInputType === "audio" ? "default" : "outline"}
              size="icon"
              className="h-10 w-10"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? "Stop recording" : "Record audio"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setIsImageDialogOpen(true)}
              disabled={isLoading || isGeneratingImage}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Generate image with AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
