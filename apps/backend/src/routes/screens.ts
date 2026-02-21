import { query, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import {
  createDb,
  createProjectRepository,
  createScreenRepository,
  createSettingsRepository,
} from "@repo/db";
import { nanoid } from "nanoid";
import { Router } from "express";
import { createHash } from "node:crypto";

const router: Router = Router();
const db = createDb();
const settingsRepo = createSettingsRepository(db);
const screensRepo = createScreenRepository(db);
const projectsRepo = createProjectRepository(db);
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const VALID_ANALYSIS_STATUSES = new Set([
  "idle",
  "processing",
  "completed",
  "failed",
]);

type SupportedImageMimeType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";
type AnalysisStatus = "idle" | "processing" | "completed" | "failed";

function isSupportedMimeType(value: string): value is SupportedImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.has(value);
}

function isValidAnalysisStatus(value: string): value is AnalysisStatus {
  return VALID_ANALYSIS_STATUSES.has(value);
}

function isUpstreamErrorDescription(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("api error:") || normalized.startsWith("error:");
}

function mapSavedScreen(row: {
  id: string;
  projectId: string;
  name: string;
  notes: string;
  previewUrl: string | null;
  analysis: string | null;
  analysisStatus: string;
  analysisError: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectName?: string;
  projectDescription?: string;
  projectWorkingDirectory?: string | null;
}) {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    notes: row.notes,
    previewUrl: row.previewUrl ?? undefined,
    analysis: row.analysis ?? undefined,
    analysisStatus: row.analysisStatus,
    analysisError: row.analysisError ?? undefined,
    projectName: row.projectName,
    projectDescription: row.projectDescription,
    projectWorkingDirectory: row.projectWorkingDirectory ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildImagePrompt(
  imageMimeType: SupportedImageMimeType,
  imageBase64: string
): AsyncIterable<SDKUserMessage> {
  async function* stream() {
    const message: SDKUserMessage = {
      type: "user",
      session_id: "",
      parent_tool_use_id: null,
      message: {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "You are a senior UX analyst. Analyze this UI screenshot and return a structured screen description in markdown focused purely on what is displayed — not interactions or behavior. Use exactly these sections:\n\n`Screen Identity` — screen name, likely route/URL, and how a user would arrive here.\n\n`Purpose Statement` — one sentence describing the job this screen does for the user.\n\n`Information Hierarchy` — what draws the eye first, second, and third; what is primary vs secondary vs tertiary content.\n\n`Content Inventory` — every visible piece of text (headings, labels, body copy, microcopy), every data field and what it represents, every image or icon and what it communicates.\n\n`Layout Structure` — the regions and zones on screen (e.g. header, sidebar, main content, footer), how content is grouped, and why those groups exist.\n\n`Component Breakdown` — list each component present (e.g. card, table, nav, form), what data it displays, and its visual weight on the page.\n\n`States Represented` — which state this screenshot captures (e.g. loaded, empty, error, partial data) and what varies between states.\n\n`Missing or Implicit Information` — what the user might need that is not shown, and what assumptions the design makes about user knowledge.",
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageMimeType,
              data: imageBase64,
            },
          },
        ],
      },
    };

    yield message;
  }

  return stream();
}

router.get("/", async (req, res) => {
  try {
    const projectId =
      typeof req.query.projectId === "string" ? req.query.projectId.trim() : undefined;
    const rows = await screensRepo.listSaved(projectId || undefined);
    res.json({ screens: rows.map(mapSavedScreen) });
  } catch (err) {
    console.error("List saved screens error:", err);
    res.status(500).json({ error: "Failed to fetch saved screens" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = (req.body ?? {}) as {
      projectId?: string;
      name?: string;
      notes?: string;
      previewUrl?: string | null;
      analysis?: string | null;
      analysisStatus?: string;
      analysisError?: string | null;
    };

    const name = body.name?.trim();
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const projectId = body.projectId?.trim();
    if (!projectId) {
      res.status(400).json({ error: "projectId is required" });
      return;
    }
    const project = await projectsRepo.getById(projectId);
    if (!project) {
      res.status(400).json({ error: "Invalid projectId" });
      return;
    }

    const analysisStatus = (body.analysisStatus ?? "idle").trim();
    if (!isValidAnalysisStatus(analysisStatus)) {
      res.status(400).json({
        error: `Invalid analysisStatus: ${analysisStatus}`,
      });
      return;
    }

    const row = await screensRepo.createSaved({
      id: nanoid(),
      projectId,
      name,
      notes: body.notes?.trim() ?? "",
      previewUrl: body.previewUrl ?? null,
      analysis: body.analysis ?? null,
      analysisStatus,
      analysisError: body.analysisError ?? null,
    });

    res.status(201).json(
      mapSavedScreen({
        ...row,
        projectName: project.name,
        projectDescription: project.description,
        projectWorkingDirectory: project.workingDirectory,
      }),
    );
  } catch (err) {
    console.error("Create saved screen error:", err);
    res.status(500).json({ error: "Failed to save screen" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = (req.body ?? {}) as {
      projectId?: string;
      name?: string;
      notes?: string;
      previewUrl?: string | null;
      analysis?: string | null;
      analysisStatus?: string;
      analysisError?: string | null;
    };

    if (body.analysisStatus && !isValidAnalysisStatus(body.analysisStatus)) {
      res.status(400).json({
        error: `Invalid analysisStatus: ${body.analysisStatus}`,
      });
      return;
    }
    const analysisStatus = body.analysisStatus as AnalysisStatus | undefined;
    const projectId = body.projectId?.trim();
    if (projectId) {
      const project = await projectsRepo.getById(projectId);
      if (!project) {
        res.status(400).json({ error: "Invalid projectId" });
        return;
      }
    }

    const row = await screensRepo.updateSaved(id, {
      projectId,
      name: body.name?.trim(),
      notes: body.notes?.trim(),
      previewUrl: body.previewUrl,
      analysis: body.analysis,
      analysisStatus,
      analysisError: body.analysisError,
    });

    if (!row) {
      res.status(404).json({ error: "Screen not found" });
      return;
    }

    const project = await projectsRepo.getById(row.projectId);
    res.json(
      mapSavedScreen({
        ...row,
        projectName: project?.name,
        projectDescription: project?.description,
        projectWorkingDirectory: project?.workingDirectory,
      }),
    );
  } catch (err) {
    console.error("Update saved screen error:", err);
    res.status(500).json({ error: "Failed to update screen" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await screensRepo.deleteSaved(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Screen not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error("Delete saved screen error:", err);
    res.status(500).json({ error: "Failed to delete screen" });
  }
});

router.post("/describe", async (req, res) => {
  try {
    const body = (req.body ?? {}) as {
      imageBase64?: string;
      imageMimeType?: string;
    };
    const imageBase64 = body.imageBase64?.trim();
    const imageMimeType = body.imageMimeType?.trim().toLowerCase();

    if (!imageBase64 || !imageMimeType) {
      res.status(400).json({ error: "imageBase64 and imageMimeType are required" });
      return;
    }

    if (!isSupportedMimeType(imageMimeType)) {
      res.status(400).json({
        error: `Unsupported imageMimeType: ${imageMimeType}`,
      });
      return;
    }

    const appSettings = await settingsRepo.get();
    const modelId = appSettings?.model ?? DEFAULT_MODEL;
    const imageSha256 = createHash("sha256").update(imageBase64).digest("hex");

    const runDescription = async (model: string) => {
      let generated = "";
      let executionError: string | null = null;
      const q = query({
        prompt: buildImagePrompt(imageMimeType, imageBase64),
        options: {
          model,
          systemPrompt:
            "You are a practical UX analyst documenting what is visually present on a screen. Be concrete and accurate. Describe only what you can see — do not speculate about behavior or code implementation.",
          includePartialMessages: true,
          permissionMode: "bypassPermissions",
          allowDangerouslySkipPermissions: true,
          tools: [],
        },
      });

      try {
        for await (const message of q) {
          if (message.type === "stream_event") {
            const event = message.event as {
              type?: string;
              delta?: { type?: string; text?: string };
            };
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta"
            ) {
              generated += event.delta.text ?? "";
            }
          } else if (message.type === "result") {
            const resultMessage = message as {
              subtype?: string;
              result?: string;
              errors?: string[];
            };
            if (resultMessage.subtype === "success") {
              generated = resultMessage.result ?? generated;
            } else {
              executionError = resultMessage.errors?.join(" ") ?? "Model execution failed";
            }
          }
        }
      } catch (err) {
        if (generated.trim()) {
          return { description: generated, error: null };
        }
        const text = err instanceof Error ? err.message : String(err);
        return { description: "", error: executionError ?? text };
      }

      return { description: generated, error: executionError };
    };

    let description = "";
    let modelUsed = modelId;
    const firstAttempt = await runDescription(modelId);
    description = firstAttempt.description;
    if (isUpstreamErrorDescription(description)) {
      description = "";
    }

    const shouldRetryWithDefaultModel =
      !description.trim() &&
      firstAttempt.error &&
      firstAttempt.error.toLowerCase().includes("could not process image") &&
      modelId !== DEFAULT_MODEL;

    if (shouldRetryWithDefaultModel) {
      const fallbackAttempt = await runDescription(DEFAULT_MODEL);
      if (fallbackAttempt.description.trim()) {
        description = fallbackAttempt.description;
        if (isUpstreamErrorDescription(description)) {
          description = "";
        }
        modelUsed = DEFAULT_MODEL;
      }
    }

    if (!description.trim()) {
      res.status(422).json({
        error:
          "Unable to process this pasted image. Try pasting a PNG/JPEG screenshot again.",
      });
      return;
    }

    const record = await screensRepo.createDescription({
      id: nanoid(),
      imageMimeType,
      imageSha256,
      description,
      model: modelUsed,
    });

    res.status(201).json({
      id: record.id,
      description: record.description,
      model: record.model,
      createdAt: record.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Screen describe error:", err);
    res.status(500).json({ error: "Failed to describe screen" });
  }
});

export { router as screensRouter };
