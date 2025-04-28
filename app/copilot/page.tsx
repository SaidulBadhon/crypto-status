"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateImageWithDallE } from "@/lib/api";
import {
  Bot,
  Send,
  User,
  Loader2,
  RefreshCw,
  Copy,
  X,
  PlusCircle,
  Image,
  Mic,
  FileAudio,
  MessageSquare,
  Paperclip,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownRenderer from "@/components/copilot/MarkdownRenderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

// Define message types
type MessageType = "text" | "image" | "audio" | "generated-image";

interface ChatMessage {
  role: "user" | "assistant";
  type: MessageType;
  content: string;
  imageUrl?: string; // URL for image messages
  audioUrl?: string; // URL for audio messages
  timestamp: Date | string; // Allow string for serialization
}

// Define conversation type
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
}

// Default welcome message
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  type: "text",
  content:
    "Hello! I'm your Crypto Copilot. I can provide insights and suggestions about cryptocurrency markets. What would you like to know today?",
  timestamp: new Date(),
};

// Available models
const AVAILABLE_MODELS = [
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
];

export default function CopilotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4.1-mini");
  const [selectedInputType, setSelectedInputType] =
    useState<MessageType>("text");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Load conversations from local storage on initial render
  useEffect(() => {
    const savedConversations = localStorage.getItem("copilotConversations");
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(
          savedConversations
        ) as Conversation[];
        setConversations(parsedConversations);

        // Load the most recent conversation if available
        const lastConversationId = localStorage.getItem("lastConversationId");
        if (lastConversationId) {
          const lastConversation = parsedConversations.find(
            (c) => c.id === lastConversationId
          );
          if (lastConversation) {
            setActiveConversationId(lastConversation.id);
            setMessages(
              lastConversation.messages.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
            );
            return;
          }
        }

        // If no last conversation or it wasn't found, create a new one
        createNewConversation();
      } catch (error) {
        console.error("Error loading conversations:", error);
        createNewConversation();
      }
    } else {
      // No saved conversations, create a new one
      createNewConversation();
    }
  }, []);

  // Create a new conversation
  const createNewConversation = (model: string = "gpt-4.1-mini") => {
    const newId = generateId();
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      messages: [WELCOME_MESSAGE],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: model,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newId);
    setMessages([WELCOME_MESSAGE]);

    // Save to local storage
    localStorage.setItem("lastConversationId", newId);
    saveConversationsToLocalStorage([newConversation, ...conversations]);
  };

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Save conversations to local storage
  const saveConversationsToLocalStorage = (convs: Conversation[]) => {
    localStorage.setItem("copilotConversations", JSON.stringify(convs));
  };

  // Update the current conversation with new messages
  const updateCurrentConversation = (
    newMessages: ChatMessage[],
    model?: string
  ) => {
    if (!activeConversationId) return;

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConversationId) {
        // Update the conversation title based on the first user message
        let title = conv.title;
        if (
          title === "New Conversation" &&
          newMessages.some((m) => m.role === "user")
        ) {
          const firstUserMessage =
            newMessages.find((m) => m.role === "user")?.content || "";
          title =
            firstUserMessage.length > 30
              ? firstUserMessage.substring(0, 30) + "..."
              : firstUserMessage;
        }

        return {
          ...conv,
          messages: newMessages,
          title,
          updatedAt: new Date().toISOString(),
          model: model || conv.model || selectedModel,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    localStorage.setItem("lastConversationId", activeConversationId);
    saveConversationsToLocalStorage(updatedConversations);
  };

  // Switch to a different conversation
  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveConversationId(conversationId);
      setMessages(
        conversation.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
      // Update the selected model to match the conversation's model
      if (conversation.model) {
        setSelectedModel(conversation.model);
      }
      localStorage.setItem("lastConversationId", conversationId);
    }
  };

  // Delete a conversation
  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversationId
    );
    setConversations(updatedConversations);
    saveConversationsToLocalStorage(updatedConversations);

    // If the active conversation was deleted, switch to another one or create a new one
    if (conversationId === activeConversationId) {
      if (updatedConversations.length > 0) {
        switchConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Update the current conversation whenever messages change
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      updateCurrentConversation(messages);
    }
  }, [messages]);

  // Process the streaming response
  const processStreamingResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ) => {
    const decoder = new TextDecoder();
    let accumulatedContent = "";

    try {
      // First, check if this is a special response (like an image generation)
      const { done: firstDone, value: firstValue } = await reader.read();
      if (firstDone) return;

      const firstChunk = decoder.decode(firstValue, { stream: true });

      // Try to parse as JSON to check if it's a special response
      try {
        const specialResponse = JSON.parse(firstChunk);
        if (specialResponse.type === "generated-image") {
          // This is an image generation response
          const assistantMessage: ChatMessage = {
            role: "assistant",
            type: "generated-image",
            content: specialResponse.content,
            imageUrl: specialResponse.imageUrl,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingContent("");
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // Not a special response, continue with normal streaming
        // Process the first chunk
        const lines = firstChunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.substring(6));
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                accumulatedContent += content;
                setStreamingContent(accumulatedContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Continue with normal streaming for text responses
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Process the chunk (for SSE format from OpenAI)
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.substring(6));
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                accumulatedContent += content;
                setStreamingContent(accumulatedContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add the complete message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        type: "text",
        content: accumulatedContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      console.error("Error processing stream:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        type: "text",
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we have content to send based on the selected input type
    if (selectedInputType === "text" && !input.trim()) return;
    if (selectedInputType === "image" && !selectedImage) return;
    if (selectedInputType === "audio" && !audioBlob) return;

    let userMessage: ChatMessage;
    let requestBody: any = {
      stream: true,
      model:
        conversations.find((c) => c.id === activeConversationId)?.model ||
        selectedModel,
    };

    // Create appropriate user message based on input type
    switch (selectedInputType) {
      case "text":
        userMessage = {
          role: "user",
          type: "text",
          content: input,
          timestamp: new Date(),
        };
        requestBody.message = input;
        break;

      case "image":
        userMessage = {
          role: "user",
          type: "image",
          content: "Image message",
          imageUrl: imagePreview,
          timestamp: new Date(),
        };

        // Create form data with the image
        const imageFormData = new FormData();
        imageFormData.append("image", selectedImage!);
        imageFormData.append("model", requestBody.model);

        // We'll use a different endpoint for image messages
        requestBody.formData = imageFormData;
        break;

      case "audio":
        userMessage = {
          role: "user",
          type: "audio",
          content: "Audio message",
          audioUrl: audioUrl,
          timestamp: new Date(),
        };

        // Create form data with the audio
        const audioFormData = new FormData();
        audioFormData.append("audio", audioBlob!);
        audioFormData.append("model", requestBody.model);

        // We'll use a different endpoint for audio messages
        requestBody.formData = audioFormData;
        break;

      default:
        return;
    }

    // Add user message to the conversation
    setMessages((prev) => [...prev, userMessage]);

    // Reset input states
    setInput("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setSelectedImage(null);
      setImagePreview("");
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioBlob(null);
      setAudioUrl("");
    }

    setSelectedInputType("text");
    setIsLoading(true);
    setStreamingContent("");

    try {
      let response;

      // Send request to appropriate API endpoint based on input type
      if (selectedInputType === "text") {
        response = await fetch("/api/copilot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      } else if (selectedInputType === "image") {
        response = await fetch("/api/copilot/image", {
          method: "POST",
          body: requestBody.formData,
        });
      } else if (selectedInputType === "audio") {
        response = await fetch("/api/copilot/audio", {
          method: "POST",
          body: requestBody.formData,
        });
      } else {
        throw new Error("Invalid input type");
      }

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (reader) {
        await processStreamingResponse(reader);
      } else {
        throw new Error("Failed to get response stream");
      }
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        type: "text",
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Function to copy message content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Handle image selection
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL for the image
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Set input type to image
      setSelectedInputType("image");
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview("");
    setSelectedInputType("text");
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        // Set input type to audio
        setSelectedInputType("audio");
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  // Handle audio removal
  const handleAudioRemove = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl("");
    setSelectedInputType("text");
  };

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);

    try {
      // Add user message with the prompt
      const userMessage: ChatMessage = {
        role: "user",
        type: "text",
        content: `Generate an image: ${imagePrompt}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Call the API to generate the image
      const result = await generateImageWithDallE(imagePrompt);

      if (result.success && result.imageUrl) {
        // Add assistant message with the generated image
        const assistantMessage: ChatMessage = {
          role: "assistant",
          type: "generated-image",
          content: "Here's the image I generated based on your prompt:",
          imageUrl: result.imageUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update the conversation
        updateCurrentConversation([...messages, userMessage, assistantMessage]);

        // Close the dialog
        setIsImageDialogOpen(false);
        setImagePrompt("");
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        type: "text",
        content:
          "Sorry, I encountered an error while generating the image. Please try again with a different prompt.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <SidebarProvider>
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

      <div className="flex h-screen w-full bg-background">
        {/* Sidebar for conversation history */}
        <Sidebar collapsible="icon">
          <SidebarRail />
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
                Conversations
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => createNewConversation(selectedModel)}
                title="New conversation"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Model selector group */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <div className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Model
                  </span>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="group-data-[collapsible=icon]:hidden">
                  <Select
                    value={
                      conversations.find((c) => c.id === activeConversationId)
                        ?.model || selectedModel
                    }
                    onValueChange={(value: string) => {
                      setSelectedModel(value);
                      if (activeConversationId) {
                        // Update the current conversation with the new model
                        updateCurrentConversation(messages, value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2 cursor-pointer hover:bg-muted rounded-md">
                        <PlusCircle className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        Current model:{" "}
                        {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                          ?.name || selectedModel}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Conversations group */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Your Conversations
                  </span>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 text-sm">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <SidebarMenuItem
                        key={conversation.id}
                        className={cn(
                          "flex justify-center rounded-md !py-4 items-center hover:bg-muted-foreground/5",
                          conversation.id === activeConversationId &&
                            "!bg-muted-foreground/15"
                        )}
                      >
                        <SidebarMenuButton
                          // isActive={conversation.id === activeConversationId}
                          onClick={() => switchConversation(conversation.id)}
                          className="justify-between bg-transparent hover:bg-transparent"
                        >
                          <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="truncate flex-1">
                            <div className="font-medium truncate text-sm">
                              {conversation.title}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                              <span>
                                {new Date(
                                  conversation.updatedAt
                                ).toLocaleDateString()}
                              </span>
                              <span className="opacity-70">
                                {AVAILABLE_MODELS.find(
                                  (m) => m.id === conversation.model
                                )?.name || conversation.model}
                              </span>
                            </div>
                          </div>
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-destructive/10 flex-shrink-0 ml-2"
                          onClick={(e) =>
                            deleteConversation(conversation.id, e)
                          }
                          title="Delete conversation"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
              Crypto Copilot v1.0
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header - fixed at the top */}
          <header className="border-b border-border py-3 px-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Crypto Copilot</h1>
              </div>
              <div className="flex gap-2 items-center">
                {/* Model selector for desktop */}
                <div className="hidden sm:block">
                  <Select
                    value={
                      conversations.find((c) => c.id === activeConversationId)
                        ?.model || selectedModel
                    }
                    onValueChange={(value: string) => {
                      setSelectedModel(value);
                      if (activeConversationId) {
                        // Update the current conversation with the new model
                        updateCurrentConversation(messages, value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => createNewConversation(selectedModel)}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">New</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          // Reset current conversation
                          if (activeConversationId) {
                            const resetMessages = [WELCOME_MESSAGE];
                            setMessages(resetMessages);
                            setStreamingContent("");
                            updateCurrentConversation(resetMessages);
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </header>

          {/* Chat messages - scrollable area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative flex max-w-[85%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-lg p-4 shadow-sm`}
                  >
                    <div className="mr-3 mt-0.5 flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                          <User className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Display content based on message type */}
                      {message.role === "assistant" &&
                      message.type === "text" ? (
                        <MarkdownRenderer content={message.content} />
                      ) : message.type === "text" ? (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      ) : message.type === "image" ? (
                        <div className="space-y-2">
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.imageUrl && (
                            <div className="rounded-md overflow-hidden border border-border">
                              <img
                                src={message.imageUrl}
                                alt="User uploaded image"
                                className="max-h-60 w-auto"
                              />
                            </div>
                          )}
                        </div>
                      ) : message.type === "audio" ? (
                        <div className="space-y-2">
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.audioUrl && (
                            <div className="rounded-md overflow-hidden border border-border p-2">
                              <audio
                                src={message.audioUrl}
                                controls
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      ) : message.type === "generated-image" ? (
                        <div className="space-y-2">
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.imageUrl && (
                            <div className="rounded-md overflow-hidden border border-border">
                              <img
                                src={message.imageUrl}
                                alt="AI generated image"
                                className="max-h-80 w-auto"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs opacity-50">
                        <div className="flex items-center gap-2">
                          <span>
                            {typeof message.timestamp === "string"
                              ? new Date(message.timestamp).toLocaleTimeString()
                              : message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === "assistant" && (
                            <span className="text-xs opacity-70">
                              {conversations.find(
                                (c) => c.id === activeConversationId
                              )?.model || selectedModel}
                            </span>
                          )}
                          {message.type !== "text" && (
                            <span className="text-xs opacity-70 capitalize">
                              {message.type}
                            </span>
                          )}
                        </div>
                        {message.role === "assistant" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-50 hover:opacity-100"
                                  onClick={() =>
                                    copyToClipboard(message.content)
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming content */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="relative flex max-w-[85%] bg-muted rounded-lg p-4 shadow-sm">
                    <div className="mr-3 mt-0.5 flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <MarkdownRenderer content={streamingContent} />
                      <div className="mt-2 flex items-center justify-between text-xs opacity-50">
                        <div className="flex items-center gap-2">
                          <span>{new Date().toLocaleTimeString()}</span>
                          <span className="text-xs opacity-70">
                            {conversations.find(
                              (c) => c.id === activeConversationId
                            )?.model || selectedModel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex justify-start">
                  <div className="flex bg-muted rounded-lg p-4 shadow-sm">
                    <div className="mr-3 mt-0.5 flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area - fixed at the bottom */}
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

                {/* Display selected image preview */}
                {selectedInputType === "image" && imagePreview && (
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
                )}

                {/* Display audio player */}
                {selectedInputType === "audio" && audioUrl && (
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
                )}

                {/* Recording indicator */}
                {isRecording && (
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
                )}

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
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant={
                              selectedInputType === "text"
                                ? "default"
                                : "outline"
                            }
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
                            variant={
                              selectedInputType === "image"
                                ? "default"
                                : "outline"
                            }
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
                            variant={
                              selectedInputType === "audio"
                                ? "default"
                                : "outline"
                            }
                            size="icon"
                            className="h-10 w-10"
                            onClick={
                              isRecording ? stopRecording : startRecording
                            }
                            disabled={isLoading}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {isRecording ? "Stop recording" : "Record audio"}
                          </p>
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
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
