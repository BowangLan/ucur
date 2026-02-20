import type { ScreenItem } from "../../types/screens";
import { formatDate } from "../../utils/date";

type ScreensGridPageProps = {
  screens: ScreenItem[];
  onOpenScreen: (screenId: string) => void;
  onDeleteScreen: (screenId: string) => void;
};

function ImagePlaceholder() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-2"
      style={{ color: "rgba(255,255,255,0.15)" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M2 15.5l5-4 3.5 2.8 4.5-5L20 15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px]">No preview</span>
    </div>
  );
}

function StatusBadge({ status, error }: { status: ScreenItem["analysisStatus"]; error?: string }) {
  if (status === "processing") {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        style={{ background: "rgba(251,191,36,0.1)", color: "rgb(251,191,36)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
        Analyzing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        style={{ background: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)" }}
        title={error}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "rgb(239,68,68)" }}
        />
        Failed
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span
        className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
        style={{ background: "rgba(52,211,153,0.1)", color: "rgb(52,211,153)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "rgb(52,211,153)" }}
        />
        Analyzed
      </span>
    );
  }
  return null;
}

export function ScreensGridPage({ screens, onOpenScreen, onDeleteScreen }: ScreensGridPageProps) {
  if (screens.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl"
        style={{
          height: "320px",
          border: "1px dashed rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <p className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
          No screens yet
        </p>
        <p className="mt-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Create your first screen to start building your collection
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {screens.map((screen) => (
        <article
          key={screen.id}
          className="group relative rounded-xl overflow-hidden transition-all duration-200"
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.13)";
            (e.currentTarget as HTMLElement).style.background = "#121212";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.background = "#0f0f0f";
          }}
        >
          {/* Screenshot thumbnail */}
          <button
            type="button"
            onClick={() => onOpenScreen(screen.id)}
            className="w-full text-left"
          >
            <div
              className="h-40 overflow-hidden"
              style={{
                background: "#080808",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {screen.previewUrl ? (
                <img
                  src={screen.previewUrl}
                  alt={`${screen.name} preview`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ opacity: 0.88 }}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            {/* Card body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3
                  className="text-[13px] font-medium leading-snug"
                  style={{ color: "rgba(255,255,255,0.88)" }}
                >
                  {screen.name}
                </h3>
                <StatusBadge
                  status={screen.analysisStatus}
                  error={screen.analysisError}
                />
              </div>

              {screen.notes && (
                <p
                  className="line-clamp-2 text-[12px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {screen.notes}
                </p>
              )}

              <p className="mt-3 text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                {formatDate(screen.createdAt)}
              </p>
            </div>
          </button>

          {/* Delete button — revealed on hover */}
          <button
            type="button"
            onClick={() => onDeleteScreen(screen.id)}
            title="Delete screen"
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all duration-150 group-hover:opacity-100"
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgb(239,68,68)";
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid rgba(239,68,68,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLButtonElement).style.background = "#0f0f0f";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2 2l6 6M8 2l-6 6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </article>
      ))}
    </div>
  );
}
