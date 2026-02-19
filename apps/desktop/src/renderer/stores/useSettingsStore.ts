import { create } from "zustand";
import { fetchSettings, updateSettings as apiUpdateSettings } from "../lib/api";

interface SettingsState {
  model: string;
  theme: "light" | "dark" | "system";
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (data: {
    model?: string;
    theme?: "light" | "dark" | "system";
  }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  model: "claude-sonnet-4-20250514",
  theme: "system",
  loading: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const data = await fetchSettings();
      set({
        model: data.model ?? "claude-sonnet-4-20250514",
        theme: data.theme ?? "system",
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (data) => {
    await apiUpdateSettings(data);
    if (data.model !== undefined) set({ model: data.model });
    if (data.theme !== undefined) set({ theme: data.theme });
  },
}));
