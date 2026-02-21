import type { PropsWithChildren } from "react";
import type { AppView } from "../../types/screens";

type AppShellProps = PropsWithChildren<{
  viewType: AppView["type"];
  onShowProjects: () => void;
  onShowScreens: () => void;
  onCreateScreen: () => void;
}>;

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 1.5v7M1.5 5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect width="18" height="18" rx="4" fill="#5E6AD2" />
      <rect x="4" y="4" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="9.5" y="4" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="4" y="9.5" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

export function AppShell({
  viewType,
  onShowProjects,
  onShowScreens,
  onCreateScreen,
  children,
}: AppShellProps) {
  const isScreensActive = viewType === "screens" || viewType === "detail";
  const isProjectsActive = viewType === "projects" || viewType === "project-detail";

  const breadcrumb =
    viewType === "create"
      ? "New Screen"
      : viewType === "detail"
        ? "Detail"
        : viewType === "project-detail"
          ? "Detail"
        : viewType === "projects"
          ? "Projects"
          : null;

  return (
    <main
      className="h-screen overflow-hidden"
      style={{ background: "#080808", color: "#f0f0f0", fontFamily: "var(--font-sans)" }}
    >
      <div className="grid h-full overflow-hidden" style={{ gridTemplateColumns: "216px 1fr" }}>
        {/* ── Sidebar ──────────────────────────────────── */}
        <aside
          className="flex flex-col"
          style={{ background: "#0b0b0b", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Brand */}
          <div
            className="flex items-center gap-2.5 px-4 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <LogoMark />
            <span
              className="text-[13px] font-semibold tracking-[-0.01em]"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Ucur
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2.5 space-y-px">
            <button
              type="button"
              onClick={onShowProjects}
              className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-all duration-150"
              style={
                isProjectsActive
                  ? {
                      background: "rgba(94,106,210,0.12)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(94,106,210,0.2)",
                    }
                  : {
                      background: "transparent",
                      color: "rgba(255,255,255,0.42)",
                      border: "1px solid transparent",
                    }
              }
            >
              <GridIcon />
              <span>Projects</span>
            </button>
            <button
              type="button"
              onClick={onShowScreens}
              className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-all duration-150"
              style={
                isScreensActive
                  ? {
                      background: "rgba(94,106,210,0.12)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(94,106,210,0.2)",
                    }
                  : {
                      background: "transparent",
                      color: "rgba(255,255,255,0.42)",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isScreensActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.72)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isScreensActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.42)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              <GridIcon />
              <span>Screens</span>
            </button>
          </nav>

          {/* Footer */}
          <div
            className="px-4 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              v0.1.0
            </p>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ background: "#080808" }}
        >
          {/* Header */}
          <header
            className="flex-shrink-0 flex items-center justify-between px-6"
            style={{
              height: "52px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(8,8,8,0.8)",
            }}
          >
            <div className="flex items-center gap-2 text-[13px]">
              <span
                className="font-medium tracking-[-0.01em]"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {viewType === "projects" || viewType === "project-detail" ? "Projects" : "Screens"}
              </span>
              {breadcrumb && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.18)" }}>/</span>
                  <span style={{ color: "rgba(255,255,255,0.38)" }}>{breadcrumb}</span>
                </>
              )}
            </div>

            {viewType !== "projects" && viewType !== "project-detail" && (
              <button
                type="button"
                onClick={onCreateScreen}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition-all duration-150"
                style={{ background: "#5E6AD2" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#6B78E5")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#5E6AD2")
                }
              >
                <PlusIcon />
                New Screen
              </button>
            )}
          </header>

          {/* Page content */}
          <section className="flex-1 overflow-auto p-6">
            <div className="animate-fade-up">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
