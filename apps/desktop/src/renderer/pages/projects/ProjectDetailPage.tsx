import type { ProjectItem, ScreenItem } from "../../types/screens";
import { formatDate } from "../../utils/date";

type ProjectDetailPageProps = {
  project: ProjectItem | null;
  screens: ScreenItem[];
  onBack: () => void;
  onOpenScreen: (screenId: string) => void;
};

export function ProjectDetailPage({
  project,
  screens,
  onBack,
  onOpenScreen,
}: ProjectDetailPageProps) {
  if (!project) {
    return (
      <div
        className="rounded-xl p-5 text-[13px]"
        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        Project not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-[12px]"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Back to projects
      </button>

      <section
        className="rounded-xl p-5"
        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h2 className="text-[20px] font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>
          {project.name}
        </h2>
        <p className="mt-2 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          {project.description || "No description"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="rounded-md px-2 py-1 text-[11px]"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }}
          >
            {project.screenCount} screens
          </span>
          {project.workingDirectory && (
            <span
              className="rounded-md px-2 py-1 text-[11px]"
              style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }}
            >
              {project.workingDirectory}
            </span>
          )}
        </div>
      </section>

      <section
        className="rounded-xl p-4"
        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h3 className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.86)" }}>
          Project Screens
        </h3>
        {screens.length === 0 ? (
          <p className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,0.36)" }}>
            No screens in this project yet.
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => onOpenScreen(screen.id)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-left"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.82)" }}>
                  {screen.name}
                </span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {formatDate(screen.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
