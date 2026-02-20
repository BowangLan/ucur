import type { ScreenItem } from "../../types/screens";
import { formatDate } from "../../utils/date";

type ScreenDetailPageProps = {
  screen: ScreenItem | null;
  onBackToScreens: () => void;
  onDeleteScreen: (screenId: string) => void;
};

function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M7.5 2L4 6l3.5 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnalysisStatus({ status }: { status: ScreenItem["analysisStatus"] }) {
  if (status === "processing") {
    return (
      <span
        className="flex items-center gap-1.5 text-[11px] font-medium"
        style={{ color: "rgb(251,191,36)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
        Analyzing…
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span
        className="flex items-center gap-1.5 text-[11px] font-medium"
        style={{ color: "rgb(52,211,153)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "rgb(52,211,153)" }}
        />
        Complete
      </span>
    );
  }
  return null;
}

function ShimmerLines() {
  const widths = [72, 88, 60, 80];
  return (
    <div className="space-y-2.5 pt-1">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-2 rounded-full animate-shimmer-bar"
          style={{
            width: `${w}%`,
            background: "rgba(255,255,255,0.08)",
            animationDelay: `${i * 180}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function ScreenDetailPage({ screen, onBackToScreens, onDeleteScreen }: ScreenDetailPageProps) {
  if (!screen) {
    return (
      <div
        className="rounded-xl p-6"
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          This screen no longer exists.
        </p>
        <button
          type="button"
          onClick={onBackToScreens}
          className="mt-3 flex items-center gap-1.5 text-[12px] transition-colors duration-150"
          style={{ color: "#5E6AD2" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#8B97F0")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#5E6AD2")
          }
        >
          <BackIcon />
          Back to screens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb / actions row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToScreens}
          className="flex items-center gap-1.5 text-[12px] transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.38)")
          }
        >
          <BackIcon />
          Back
        </button>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>/</span>
        <span
          className="text-[12px] max-w-[220px] truncate"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          {screen.name}
        </span>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => onDeleteScreen(screen.id)}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-all duration-150"
            style={{
              color: "rgba(239,68,68,0.75)",
              border: "1px solid rgba(239,68,68,0.18)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgb(239,68,68)";
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid rgba(239,68,68,0.35)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(239,68,68,0.75)";
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid rgba(239,68,68,0.18)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Screen title + date */}
      <div>
        <h2
          className="text-[22px] font-semibold tracking-[-0.02em]"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          {screen.name}
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Created {formatDate(screen.createdAt)}
        </p>
      </div>

      {/* Content grid */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Preview panel */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
              Preview
            </span>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ height: "288px", background: "#080808" }}
          >
            {screen.previewUrl ? (
              <img
                src={screen.previewUrl}
                alt={`${screen.name} preview`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center" style={{ color: "rgba(255,255,255,0.14)" }}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="mx-auto mb-2.5"
                >
                  <rect
                    x="3"
                    y="5"
                    width="22"
                    height="18"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle cx="9.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M3 18l7-5.5 5 4 5-5.5 8 7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-[12px]">No screenshot available</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata panel */}
        <div className="flex flex-col gap-4">
          {/* Notes */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              className="text-[12px] font-medium mb-2.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Notes
            </p>
            {screen.notes ? (
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                {screen.notes}
              </p>
            ) : (
              <p className="text-[12px] italic" style={{ color: "rgba(255,255,255,0.22)" }}>
                No notes for this screen.
              </p>
            )}
          </div>

          {/* AI Description */}
          <div
            className="flex-1 rounded-xl p-4"
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[12px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                AI Description
              </p>
              <AnalysisStatus status={screen.analysisStatus} />
            </div>

            {screen.analysisStatus === "processing" ? (
              <ShimmerLines />
            ) : screen.analysis ? (
              <pre
                className="max-h-52 overflow-auto whitespace-pre-wrap leading-relaxed"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.52)",
                }}
              >
                {screen.analysis}
              </pre>
            ) : screen.analysisStatus === "failed" ? (
              <p className="text-[12px]" style={{ color: "rgb(239,68,68)" }}>
                {screen.analysisError || "Failed to generate description."}
              </p>
            ) : (
              <p className="text-[12px] italic" style={{ color: "rgba(255,255,255,0.22)" }}>
                No description generated yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
