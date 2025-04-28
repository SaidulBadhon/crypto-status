// Define message types
export type MessageType = "text" | "image" | "audio" | "generated-image";

export interface ChatMessage {
  role: "user" | "assistant";
  type: MessageType;
  content: string;
  imageUrl?: string; // URL for image messages
  audioUrl?: string; // URL for audio messages
  timestamp: Date | string; // Allow string for serialization
}

// Define conversation type
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
}

// Define model type
export interface Model {
  id: string;
  name: string;
}
