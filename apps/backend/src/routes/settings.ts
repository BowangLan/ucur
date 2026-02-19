import { Router } from "express";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { createDb, createSettingsRepository } from "@repo/db";

const router: Router = Router();
const db = createDb();
const settingsRepo = createSettingsRepository(db);
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface ModelOption {
  value: string;
  displayName: string;
  description?: string;
}

async function getSupportedModelOptions(): Promise<ModelOption[]> {
  const q = query({
    prompt: " ",
    options: {},
  });
  const models = await q.supportedModels();
  return models.map((model) => ({
    value: model.value,
    displayName: model.displayName,
    description: model.description,
  }));
}

router.get("/models", async (_req, res) => {
  try {
    const models = await getSupportedModelOptions();
    res.json({ models });
  } catch (err) {
    console.error("Get supported models error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const settings = await settingsRepo.get();
    res.json({
      model: settings?.model ?? DEFAULT_MODEL,
      theme: settings?.theme ?? "system",
    });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { model, theme } = (req.body ?? {}) as {
      model?: string;
      theme?: string;
    };
    const data: { model?: string; theme?: string } = {};
    if (model !== undefined) data.model = model;
    if (theme !== undefined) data.theme = theme;
    await settingsRepo.upsert(data);
    const settings = await settingsRepo.get();
    res.json({
      model: settings?.model ?? DEFAULT_MODEL,
      theme: settings?.theme ?? "system",
    });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

export { router as settingsRouter };
