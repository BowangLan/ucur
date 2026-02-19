import { eq, asc } from "drizzle-orm";
import type { Db } from "../client.js";
import { messages } from "../schema.js";

export function createMessageRepository(db: Db) {
  return {
    async create(id: string, conversationId: string, role: string, content: string) {
      const [row] = await db
        .insert(messages)
        .values({ id, conversationId, role, content })
        .returning();
      return row;
    },

    async listByConversation(conversationId: string) {
      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
    },
  };
}
