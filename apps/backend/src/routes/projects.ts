import {
  createDb,
  createProjectRepository,
  createScreenRepository,
} from "@repo/db";
import { nanoid } from "nanoid";
import { Router } from "express";

const router: Router = Router();
const db = createDb();
const projectsRepo = createProjectRepository(db);
const screensRepo = createScreenRepository(db);

function mapProject(row: {
  id: string;
  name: string;
  description: string;
  workingDirectory: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    workingDirectory: row.workingDirectory ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  try {
    const rows = await projectsRepo.list();
    const projects = await Promise.all(
      rows.map(async (row) => ({
        ...mapProject(row),
        screenCount: await screensRepo.countSavedByProject(row.id),
      })),
    );
    res.json({ projects });
  } catch (err) {
    console.error("List projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = (req.body ?? {}) as {
      name?: string;
      description?: string;
      workingDirectory?: string | null;
    };

    const name = body.name?.trim();
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const row = await projectsRepo.create({
      id: nanoid(),
      name,
      description: body.description?.trim() ?? "",
      workingDirectory: body.workingDirectory?.trim() || null,
    });

    res.status(201).json({
      ...mapProject(row),
      screenCount: 0,
    });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = (req.body ?? {}) as {
      name?: string;
      description?: string;
      workingDirectory?: string | null;
    };

    const row = await projectsRepo.update(req.params.id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      workingDirectory:
        body.workingDirectory === undefined ? undefined : body.workingDirectory?.trim() || null,
    });

    if (!row) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({
      ...mapProject(row),
      screenCount: await screensRepo.countSavedByProject(row.id),
    });
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const screenCount = await screensRepo.countSavedByProject(req.params.id);
    if (screenCount > 0) {
      res.status(409).json({
        error: "Project has screens. Reassign or delete those screens first.",
      });
      return;
    }

    const deleted = await projectsRepo.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export { router as projectsRouter };
