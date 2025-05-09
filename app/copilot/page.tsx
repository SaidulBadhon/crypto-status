"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  RefreshCw,
  Copy,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownRenderer from "@/components/copilot/MarkdownRenderer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define message type
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string; // Allow string for serialization
}

// Define conversation type
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Default welcome message
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your Crypto Copilot. I can provide insights and suggestions about cryptocurrency markets. What would you like to know today?",
  timestamp: new Date(),
};

export default function CopilotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const createNewConversation = () => {
    const newId = generateId();
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      messages: [WELCOME_MESSAGE],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
  const updateCurrentConversation = (newMessages: ChatMessage[]) => {
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
      localStorage.setItem("lastConversationId", conversationId);
      setShowConversations(false);
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
        content: accumulatedContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      console.error("Error processing stream:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
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
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Send request to API with streaming enabled
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, stream: true }),
      });

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

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar for conversation history */}
      <div
        className={`fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-all duration-100
          ${
            showConversations ? "opacity-100" : "opacity-0 pointer-events-none"
          } md:relative md:opacity-100 md:pointer-events-auto md:w-72 md:border-r md:border-border md:flex-shrink-0`}
      >
        <div className="h-full w-full md:w-72 bg-background md:bg-transparent flex flex-col">
          {/* Sidebar header */}
          <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-sm">Conversations</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={createNewConversation}
                title="New conversation"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setShowConversations(false)}
                title="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground p-4 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="py-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`px-3 py-2 mx-2 my-1 rounded-md cursor-pointer flex justify-between items-center hover:bg-accent/50 transition-colors ${
                      conversation.id === activeConversationId
                        ? "bg-accent"
                        : ""
                    }`}
                    onClick={() => switchConversation(conversation.id)}
                  >
                    <div className="truncate flex-1 mr-2">
                      <div className="font-medium truncate text-sm">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-destructive/10 flex-shrink-0"
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      title="Delete conversation"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - fixed at the top */}
        <header className="border-b border-border py-3 px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowConversations(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Crypto Copilot</h1>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={createNewConversation}
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
                    {message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between text-xs opacity-50">
                      <span>
                        {typeof message.timestamp === "string"
                          ? new Date(message.timestamp).toLocaleTimeString()
                          : message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === "assistant" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                onClick={() => copyToClipboard(message.content)}
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
                      <span>{new Date().toLocaleTimeString()}</span>
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
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crypto markets..."
                disabled={isLoading}
                className="flex-1 py-5"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                <span>Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
