import { eq } from "drizzle-orm";
import type { Db } from "../client.js";
import { settings } from "../schema.js";

export function createSettingsRepository(db: Db) {
  return {
    async get() {
      const [row] = await db
        .select()
        .from(settings)
        .where(eq(settings.id, "default"));
      return row ?? null;
    },

    async upsert(data: { model?: string; theme?: string }) {
      const existing = await this.get();
      const updateData = { ...data, updatedAt: new Date() };
      if (existing) {
        const [row] = await db
          .update(settings)
          .set(updateData)
          .where(eq(settings.id, "default"))
          .returning();
        return row!;
      }
      const [row] = await db
        .insert(settings)
        .values({ id: "default", ...updateData })
        .returning();
      return row!;
    },
  };
}
