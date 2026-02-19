// Chat & conversation types
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings types
export interface AppSettings {
  apiKey?: string;
  model?: string;
  theme?: "light" | "dark" | "system";
}

// API request/response types
export interface CreateConversationRequest {
  title?: string;
}

export interface CreateConversationResponse {
  id: string;
  title: string;
  createdAt: string;
}

export interface ListConversationsResponse {
  conversations: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface GetConversationResponse {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    createdAt: string;
  }>;
}
