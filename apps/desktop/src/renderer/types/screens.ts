export type ScreenItem = {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  previewUrl?: string;
  analysis?: string;
  analysisStatus: "idle" | "processing" | "completed" | "failed";
  analysisError?: string;
};

export type AppView =
  | { type: "screens" }
  | { type: "detail"; screenId: string }
  | { type: "create" };
