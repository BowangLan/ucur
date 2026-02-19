import { query } from "@anthropic-ai/claude-agent-sdk";
import { Router } from "express";

const router: Router = Router();

router.get("/", async (_req, res) => {
  try {
    const q = query({
      prompt: "ping",
      options: {
        maxTurns: 1,
        tools: [],
        includePartialMessages: false,
      },
    });
    const info = await q.accountInfo();
    res.json(info);
  } catch (err) {
    console.error("Account info error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to get account info",
    });
  }
});

export { router as accountRouter };
