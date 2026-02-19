import { eq, desc } from "drizzle-orm";
import type { Db } from "../client.js";
import { conversations, messages } from "../schema.js";

export function createConversationRepository(db: Db) {
  return {
    async create(id: string, title = "New Chat") {
      const [row] = await db
        .insert(conversations)
        .values({ id, title })
        .returning();
      return row;
    },

    async updateClaudeSessionId(id: string, claudeSessionId: string) {
      const [row] = await db
        .update(conversations)
        .set({ claudeSessionId, updatedAt: new Date() })
        .where(eq(conversations.id, id))
        .returning();
      return row;
    },

    async list() {
      return db
        .select()
        .from(conversations)
        .orderBy(desc(conversations.updatedAt));
    },

    async getById(id: string) {
      const [conv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, id));
      return conv ?? null;
    },

    async getWithMessages(id: string) {
      const conv = await this.getById(id);
      if (!conv) return null;
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);
      return { ...conv, messages: msgs };
    },

    async updateTitle(id: string, title: string) {
      const [row] = await db
        .update(conversations)
        .set({ title, updatedAt: new Date() })
        .where(eq(conversations.id, id))
        .returning();
      return row;
    },

    async updateTimestamp(id: string) {
      const [row] = await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, id))
        .returning();
      return row;
    },

    async delete(id: string) {
      await db.delete(conversations).where(eq(conversations.id, id));
    },
  };
}
