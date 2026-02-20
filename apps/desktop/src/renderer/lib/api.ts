const API_BASE = "http://localhost:3001/api";

export interface SettingsModelOption {
  value: string;
  displayName: string;
  description?: string;
}

export interface ScreenDescriptionResponse {
  id: string;
  description: string;
  model: string;
  createdAt: string;
}

export interface SavedScreenResponse {
  id: string;
  name: string;
  notes: string;
  previewUrl?: string;
  analysis?: string;
  analysisStatus: "idle" | "processing" | "completed" | "failed";
  analysisError?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function createConversation(title?: string) {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function fetchConversation(id: string) {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function deleteConversation(id: string) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete conversation");
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function fetchSettingsModels() {
  const res = await fetch(`${API_BASE}/settings/models`);
  if (!res.ok) throw new Error("Failed to fetch settings model options");
  const data = (await res.json()) as { models?: SettingsModelOption[] };
  return data.models ?? [];
}

export async function fetchAccount() {
  const res = await fetch(`${API_BASE}/account`);
  if (!res.ok) throw new Error("Failed to fetch account");
  return res.json();
}

export async function updateSettings(data: {
  model?: string;
  theme?: string;
}) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

export async function describeScreenScreenshot(payload: {
  imageBase64: string;
  imageMimeType: string;
}) {
  const res = await fetch(`${API_BASE}/screens/describe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to describe UI screenshot");
  }

  return (await res.json()) as ScreenDescriptionResponse;
}

export async function fetchSavedScreens() {
  const res = await fetch(`${API_BASE}/screens`);
  if (!res.ok) throw new Error("Failed to fetch saved screens");
  const body = (await res.json()) as { screens?: SavedScreenResponse[] };
  return body.screens ?? [];
}

export async function createSavedScreen(payload: {
  name: string;
  notes: string;
  previewUrl?: string;
  analysis?: string;
  analysisStatus: "idle" | "processing" | "completed" | "failed";
  analysisError?: string;
}) {
  const res = await fetch(`${API_BASE}/screens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to save screen");
  }

  return (await res.json()) as SavedScreenResponse;
}

export async function updateSavedScreen(
  id: string,
  payload: Partial<{
    name: string;
    notes: string;
    previewUrl: string | null;
    analysis: string | null;
    analysisStatus: "idle" | "processing" | "completed" | "failed";
    analysisError: string | null;
  }>,
) {
  const res = await fetch(`${API_BASE}/screens/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to update screen");
  }

  return (await res.json()) as SavedScreenResponse;
}

export async function deleteSavedScreen(id: string) {
  const res = await fetch(`${API_BASE}/screens/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete screen");
}
