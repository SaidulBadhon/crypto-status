import { ChatMessage, Model } from "./types";

// Default welcome message
export const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  type: "text",
  content:
    "Hello! I'm your Crypto Copilot. I can provide insights and suggestions about cryptocurrency markets. What would you like to know today?",
  timestamp: new Date(),
};

// Available models
export const AVAILABLE_MODELS: Model[] = [
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
];
