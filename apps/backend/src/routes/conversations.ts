import { Router } from "express";
import { nanoid } from "nanoid";
import {
  createDb,
  createConversationRepository,
  createMessageRepository,
} from "@repo/db";

const router: Router = Router();
const db = createDb();
const conversations = createConversationRepository(db);
const messages = createMessageRepository(db);

router.get("/", async (_req, res) => {
  try {
    const list = await conversations.list();
    res.json({
      conversations: list.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("List conversations error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = (req.body ?? {}) as { title?: string };
    const id = nanoid();
    await conversations.create(id, title ?? "New Chat");
    const conv = await conversations.getById(id);
    if (!conv) throw new Error("Failed to create conversation");
    res.status(201).json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await conversations.getWithMessages(id);
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({
      id: conv.id,
      title: conv.title,
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await conversations.delete(id);
    res.status(204).send();
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

export { router as conversationsRouter };
