"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { generateImageWithDallE } from "@/lib/api";
import { ChatMessage, Conversation, MessageType } from "../types";
import { WELCOME_MESSAGE, AVAILABLE_MODELS } from "../constants";

interface CopilotContextType {
  // State
  conversations: Conversation[];
  activeConversationId: string;
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  streamingContent: string;
  selectedModel: string;
  selectedInputType: MessageType;
  selectedImage: File | null;
  imagePreview: string;
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string;
  imagePrompt: string;
  isGeneratingImage: boolean;
  isImageDialogOpen: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Setters
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSelectedInputType: React.Dispatch<React.SetStateAction<MessageType>>;
  setImagePrompt: React.Dispatch<React.SetStateAction<string>>;
  setIsImageDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Functions
  createNewConversation: (model?: string) => void;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string, e: React.MouseEvent) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  copyToClipboard: (content: string) => void;
  handleImageSelect: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageRemove: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handleAudioRemove: () => void;
  handleGenerateImage: () => Promise<void>;
}

export const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4.1-mini");
  const [selectedInputType, setSelectedInputType] = useState<MessageType>("text");
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

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Update the current conversation whenever messages change
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      updateCurrentConversation(messages);
    }
  }, [messages, activeConversationId]);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Save conversations to local storage
  const saveConversationsToLocalStorage = (convs: Conversation[]) => {
    localStorage.setItem("copilotConversations", JSON.stringify(convs));
  };

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

  const value = {
    // State
    conversations,
    activeConversationId,
    messages,
    input,
    isLoading,
    streamingContent,
    selectedModel,
    selectedInputType,
    selectedImage,
    imagePreview,
    isRecording,
    audioBlob,
    audioUrl,
    imagePrompt,
    isGeneratingImage,
    isImageDialogOpen,
    messagesEndRef,
    fileInputRef,
    
    // Setters
    setInput,
    setSelectedInputType,
    setImagePrompt,
    setIsImageDialogOpen,
    
    // Functions
    createNewConversation,
    switchConversation,
    deleteConversation,
    handleSubmit,
    copyToClipboard,
    handleImageSelect,
    handleImageChange,
    handleImageRemove,
    startRecording,
    stopRecording,
    handleAudioRemove,
    handleGenerateImage,
  };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (context === undefined) {
    throw new Error("useCopilot must be used within a CopilotProvider");
  }
  return context;
};
