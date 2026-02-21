import { count, desc, eq } from "drizzle-orm";
import type { Db } from "../client.js";
import { projects, savedScreens, screens } from "../schema.js";

export function createScreenRepository(db: Db) {
  return {
    async createDescription(data: {
      id: string;
      imageMimeType: string;
      imageSha256: string;
      description: string;
      model: string;
    }) {
      const [row] = await db.insert(screens).values(data).returning();
      return row;
    },

    async listRecentDescriptions(limit = 20) {
      return db
        .select()
        .from(screens)
        .orderBy(desc(screens.createdAt))
        .limit(limit);
    },

    async createSaved(data: {
      id: string;
      projectId: string;
      name: string;
      notes: string;
      previewUrl?: string | null;
      analysis?: string | null;
      analysisStatus: "idle" | "processing" | "completed" | "failed";
      analysisError?: string | null;
    }) {
      const [row] = await db
        .insert(savedScreens)
        .values({
          id: data.id,
          projectId: data.projectId,
          name: data.name,
          notes: data.notes,
          previewUrl: data.previewUrl ?? null,
          analysis: data.analysis ?? null,
          analysisStatus: data.analysisStatus,
          analysisError: data.analysisError ?? null,
        })
        .returning();
      return row;
    },

    async listSaved(projectId?: string) {
      const query = db
        .select({
          id: savedScreens.id,
          projectId: savedScreens.projectId,
          name: savedScreens.name,
          notes: savedScreens.notes,
          previewUrl: savedScreens.previewUrl,
          analysis: savedScreens.analysis,
          analysisStatus: savedScreens.analysisStatus,
          analysisError: savedScreens.analysisError,
          createdAt: savedScreens.createdAt,
          updatedAt: savedScreens.updatedAt,
          projectName: projects.name,
          projectDescription: projects.description,
          projectWorkingDirectory: projects.workingDirectory,
        })
        .from(savedScreens)
        .innerJoin(projects, eq(savedScreens.projectId, projects.id))
        .orderBy(desc(savedScreens.createdAt));

      if (projectId) {
        return query.where(eq(savedScreens.projectId, projectId));
      }

      return query;
    },

    async updateSaved(
      id: string,
      patch: {
        projectId?: string;
        name?: string;
        notes?: string;
        previewUrl?: string | null;
        analysis?: string | null;
        analysisStatus?: "idle" | "processing" | "completed" | "failed";
        analysisError?: string | null;
      }
    ) {
      const values: Partial<typeof savedScreens.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (patch.name !== undefined) values.name = patch.name;
      if (patch.projectId !== undefined) values.projectId = patch.projectId;
      if (patch.notes !== undefined) values.notes = patch.notes;
      if (patch.previewUrl !== undefined) values.previewUrl = patch.previewUrl;
      if (patch.analysis !== undefined) values.analysis = patch.analysis;
      if (patch.analysisStatus !== undefined) {
        values.analysisStatus = patch.analysisStatus;
      }
      if (patch.analysisError !== undefined) {
        values.analysisError = patch.analysisError;
      }

      const [row] = await db
        .update(savedScreens)
        .set(values)
        .where(eq(savedScreens.id, id))
        .returning();
      return row ?? null;
    },

    async deleteSaved(id: string) {
      const [row] = await db
        .delete(savedScreens)
        .where(eq(savedScreens.id, id))
        .returning({ id: savedScreens.id });
      return row ?? null;
    },

    async countSavedByProject(projectId: string) {
      const [row] = await db
        .select({ value: count(savedScreens.id) })
        .from(savedScreens)
        .where(eq(savedScreens.projectId, projectId));
      return row?.value ?? 0;
    },
  };
}
