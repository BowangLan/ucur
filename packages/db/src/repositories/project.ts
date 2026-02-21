import { asc, eq } from "drizzle-orm";
import type { Db } from "../client.js";
import { projects } from "../schema.js";

export function createProjectRepository(db: Db) {
  return {
    async create(data: {
      id: string;
      name: string;
      description: string;
      workingDirectory?: string | null;
    }) {
      const [row] = await db
        .insert(projects)
        .values({
          id: data.id,
          name: data.name,
          description: data.description,
          workingDirectory: data.workingDirectory ?? null,
        })
        .returning();
      return row;
    },

    async list() {
      return db.select().from(projects).orderBy(asc(projects.name));
    },

    async getById(id: string) {
      const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return row ?? null;
    },

    async update(
      id: string,
      patch: {
        name?: string;
        description?: string;
        workingDirectory?: string | null;
      },
    ) {
      const [row] = await db
        .update(projects)
        .set({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.workingDirectory !== undefined
            ? { workingDirectory: patch.workingDirectory }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();
      return row ?? null;
    },

    async delete(id: string) {
      const [row] = await db.delete(projects).where(eq(projects.id, id)).returning({
        id: projects.id,
      });
      return row ?? null;
    },
  };
}
