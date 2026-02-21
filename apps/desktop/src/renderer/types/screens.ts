export type ScreenItem = {
  id: string;
  projectId: string;
  projectName?: string;
  projectDescription?: string;
  projectWorkingDirectory?: string;
  name: string;
  notes: string;
  createdAt: string;
  previewUrl?: string;
  analysis?: string;
  analysisStatus: "idle" | "processing" | "completed" | "failed";
  analysisError?: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string;
  workingDirectory?: string;
  screenCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AppView =
  | { type: "projects" }
  | { type: "project-detail"; projectId: string }
  | { type: "screens" }
  | { type: "detail"; screenId: string }
  | { type: "create" };
