import { query } from "@anthropic-ai/claude-agent-sdk";
import { Router } from "express";
import { Readable } from "node:stream";
import {
  createDb,
  createConversationRepository,
  createMessageRepository,
  createSettingsRepository,
} from "@repo/db";
import { nanoid } from "nanoid";

const router: Router = Router();
const db = createDb();
const conversations = createConversationRepository(db);
const messages = createMessageRepository(db);
const settingsRepo = createSettingsRepository(db);

function buildPromptFromMessages(
  uiMessages: Array<{
    role: string;
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  }>
): string {
  const lines: string[] = [];
  for (const m of uiMessages) {
    const partText =
      m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") ?? "";
    const text = partText || m.content || "";
    if (text) {
      lines.push(`${m.role === "user" ? "User" : "Assistant"}: ${text}`);
    }
  }
  return lines.join("\n\n");
}

function extractText(uiMessages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>): string {
  const lastUser = uiMessages.filter((m) => m.role === "user").pop();
  const partText =
    lastUser?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";
  return partText || lastUser?.content || "";
}

router.post("/", async (req, res) => {
  try {
    const { messages: uiMessages, conversationId } = req.body as {
      messages: Array<{ role: string; content?: string; parts?: Array<{ type: string; text?: string }> }>;
      conversationId?: string;
    };

    const appSettings = await settingsRepo.get();
    console.log("[chat] appSettings:", appSettings);
    const modelId = appSettings?.model ?? "claude-sonnet-4-20250514";

    let convId = conversationId;
    let isNewConversation = false;
    let existingConv = null;

    if (!convId) {
      convId = nanoid();
      isNewConversation = true;
      await conversations.create(convId, "New Chat");
    } else {
      existingConv = await conversations.getById(convId);
    }

    // When resuming a session, only send the new message; otherwise send full conversation
    const msgs = uiMessages ?? [];
    const sessionId: string | null = existingConv?.claudeSessionId ?? null;
    const prompt = sessionId
      ? extractText(msgs)
      : buildPromptFromMessages(msgs);
    if (!prompt.trim()) {
      res.status(400).json({ error: "No messages provided" });
      return;
    }

    let fullText = "";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emitPart = (code: "0" | "3" | "d", value: unknown) => {
          controller.enqueue(encoder.encode(`${code}:${JSON.stringify(value)}\n`));
        };

        try {
          let capturedSessionId: string | null = sessionId;
          const options: Parameters<typeof query>[0]["options"] = {
            model: modelId,
            systemPrompt: "You are a helpful coding assistant. Be concise and practical.",
            includePartialMessages: true,
            permissionMode: "bypassPermissions",     // ← most important for YOLO
            allowDangerouslySkipPermissions: true,
            tools: { type: "preset", preset: "claude_code" },
            // Claude Code manages API keys - no env override
          };
          if (sessionId) {
            options.resume = sessionId;
          }

          console.log("[chat] query options:", options);

          const q = query({ prompt, options });

          for await (const message of q) {
            if (message.type === "system" && (message as { subtype?: string }).subtype === "init") {
              capturedSessionId = (message as { session_id: string }).session_id;
            }
            if (message.type === "stream_event") {
              const event = message.event as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                const chunk = event.delta.text ?? "";
                fullText += chunk;
                emitPart("0", chunk);
              }
            } else if (message.type === "result" && (message as { subtype?: string }).subtype === "success") {
              fullText = (message as { result?: string }).result ?? fullText;
            }
          }

          if (capturedSessionId) {
            await conversations.updateClaudeSessionId(convId!, capturedSessionId);
          }

          emitPart("d", { finishReason: "stop" });
        } catch (err) {
          console.error("Agent SDK error:", err);
          emitPart("3", String(err));
        }

        controller.close();

        const lastUserContent = extractText(uiMessages ?? []);
        await messages.create(nanoid(), convId!, "user", lastUserContent);
        await messages.create(nanoid(), convId!, "assistant", fullText);
        await conversations.updateTimestamp(convId!);
        if (isNewConversation && lastUserContent) {
          const title =
            lastUserContent.slice(0, 50) + (lastUserContent.length > 50 ? "…" : "");
          await conversations.updateTitle(convId!, title);
        }
      },
    });

    res.setHeader("X-Conversation-Id", convId);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Readable.fromWeb(stream as any).pipe(res);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

export { router as chatRouter };
