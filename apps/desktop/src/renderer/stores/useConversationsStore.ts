import { create } from "zustand";
import {
  fetchConversations,
  createConversation as apiCreateConversation,
  deleteConversation as apiDeleteConversation,
} from "../lib/api";

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationsState {
  conversations: ConversationItem[];
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<ConversationItem>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  loading: false,
  hasLoaded: false,
  error: null,

  loadConversations: async () => {
    set({ loading: true, error: null });
    try {
      const { conversations } = await fetchConversations();
      set({ conversations, loading: false, hasLoaded: true });
    } catch (err) {
      set({
        loading: false,
        hasLoaded: true,
        error: err instanceof Error ? err.message : "Failed to load",
      });
    }
  },

  createConversation: async (title?: string) => {
    const conv = await apiCreateConversation(title);
    set((s) => ({
      conversations: [conv, ...s.conversations],
    }));
    return conv;
  },

  deleteConversation: async (id: string) => {
    await apiDeleteConversation(id);
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
    }));
  },
}));
