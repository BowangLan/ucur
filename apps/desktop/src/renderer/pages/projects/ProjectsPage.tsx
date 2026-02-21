import { useState } from "react";
import type { ProjectItem } from "../../types/screens";

type ProjectsPageProps = {
  projects: ProjectItem[];
  selectedProjectId: string | null;
  error: string | null;
  onSelectProject: (projectId: string) => void;
  onOpenProject: (projectId: string) => void;
  onCreateProject: (payload: {
    name: string;
    description: string;
    workingDirectory: string;
  }) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
};

export function ProjectsPage({
  projects,
  selectedProjectId,
  error,
  onSelectProject,
  onOpenProject,
  onCreateProject,
  onDeleteProject,
}: ProjectsPageProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const create = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onCreateProject({
        name: name.trim(),
        description: description.trim(),
        workingDirectory: workingDirectory.trim(),
      });
      setName("");
      setDescription("");
      setWorkingDirectory("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div
        className="rounded-xl p-4"
        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
          New Project
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="rounded-md px-3 py-2 text-[13px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <input
            value={workingDirectory}
            onChange={(event) => setWorkingDirectory(event.target.value)}
            placeholder="Working directory (optional)"
            className="rounded-md px-3 py-2 text-[13px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <button
            type="button"
            onClick={create}
            className="rounded-md px-3 py-2 text-[12px] font-medium text-white"
            style={{ background: "#5E6AD2" }}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Project"}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Project description"
          className="mt-3 w-full rounded-md px-3 py-2 text-[13px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      </div>

      {error && (
        <div
          className="rounded-lg px-3 py-2 text-[12px]"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "rgb(239,68,68)",
          }}
        >
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div
          className="rounded-xl px-4 py-5 text-[13px]"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          No projects yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => {
            const selected = project.id === selectedProjectId;
            return (
              <article
                key={project.id}
                className="rounded-xl p-4"
                style={{
                  background: selected ? "rgba(94,106,210,0.12)" : "#0f0f0f",
                  border: selected
                    ? "1px solid rgba(94,106,210,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      onSelectProject(project.id);
                      onOpenProject(project.id);
                    }}
                  >
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {project.name}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {project.screenCount} screens
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteProject(project.id)}
                    className="rounded-md px-2 py-1 text-[11px]"
                    style={{
                      color: "rgba(239,68,68,0.8)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {project.description || "No description"}
                </p>
                {project.workingDirectory && (
                  <p
                    className="mt-2 rounded-md px-2 py-1 text-[11px]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {project.workingDirectory}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
