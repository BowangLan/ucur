import type { ChangeEvent, ClipboardEvent } from "react";
import type { ScreenDescriptionResponse } from "../../lib/api";

type CreateScreenPageProps = {
  name: string;
  notes: string;
  previewUrl: string | null;
  analysis: ScreenDescriptionResponse | null;
  imageMimeType: string | null;
  isAnalyzing: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasteImage: (event: ClipboardEvent<HTMLDivElement>) => void;
  onCancel: () => void;
  onSave: () => void;
};

function UploadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M5.5 1v6M3 3.5L5.5 1 8 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 8.5v1A0.5 0.5 0 002 10h7a0.5 0.5 0 00.5-.5v-1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShimmerLines() {
  const widths = [80, 65, 90, 55];
  return (
    <div className="space-y-2.5 pt-0.5">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-2 rounded-full animate-shimmer-bar"
          style={{
            width: `${w}%`,
            background: "rgba(255,255,255,0.08)",
            animationDelay: `${i * 160}ms`,
          }}
        />
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  color: "rgba(255,255,255,0.88)",
  outline: "none",
  transition: "border-color 0.15s, background 0.15s",
  fontFamily: "var(--font-sans)",
};

function StyledInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => {
        (e.target as HTMLInputElement).style.borderColor = "rgba(94,106,210,0.55)";
        (e.target as HTMLInputElement).style.background = "rgba(255,255,255,0.05)";
      }}
      onBlur={(e) => {
        (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.target as HTMLInputElement).style.background = "rgba(255,255,255,0.03)";
      }}
    />
  );
}

export function CreateScreenPage({
  name,
  notes,
  previewUrl,
  analysis,
  imageMimeType,
  isAnalyzing,
  error,
  onNameChange,
  onNotesChange,
  onFileSelect,
  onPasteImage,
  onCancel,
  onSave,
}: CreateScreenPageProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-4 xl:grid-cols-2">
        {/* ── Left: form ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h2
              className="text-[14px] font-semibold tracking-[-0.01em]"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              New Screen
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Add a screenshot to your collection
            </p>
          </div>

          <div className="p-5 space-y-5">
            {/* Name field */}
            <label className="block">
              <span
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Name
              </span>
              <StyledInput
                value={name}
                onChange={onNameChange}
                placeholder="e.g. Checkout Summary"
              />
            </label>

            {/* Notes field */}
            <label className="block">
              <span
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={5}
                placeholder="Describe what this screen is for..."
                style={{
                  ...inputStyle,
                  resize: "none",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor =
                    "rgba(94,106,210,0.55)";
                  (e.target as HTMLTextAreaElement).style.background =
                    "rgba(255,255,255,0.05)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                  (e.target as HTMLTextAreaElement).style.background =
                    "rgba(255,255,255,0.03)";
                }}
              />
            </label>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="flex-shrink-0 mt-px"
                  style={{ color: "rgb(239,68,68)" }}
                >
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M6 3.5V6M6 8h.01"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-[12px]" style={{ color: "rgb(239,68,68)" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between pt-1">
              <label
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-all duration-150"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.color = "rgba(255,255,255,0.78)";
                  (e.currentTarget as HTMLLabelElement).style.border =
                    "1px solid rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLLabelElement).style.background =
                    "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.color = "rgba(255,255,255,0.55)";
                  (e.currentTarget as HTMLLabelElement).style.border =
                    "1px solid rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLLabelElement).style.background = "transparent";
                }}
              >
                <UploadIcon />
                Upload image
                <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-md px-3 py-1.5 text-[12px] transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.65)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.4)")
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  className="rounded-md px-4 py-1.5 text-[12px] font-medium text-white transition-all duration-150"
                  style={{ background: "#5E6AD2" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#6B78E5")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#5E6AD2")
                  }
                >
                  Save Screen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: screenshot + analysis ── */}
        <div className="flex flex-col gap-4">
          {/* Drop / paste zone */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onPaste={onPasteImage}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                className="text-[12px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Screenshot
              </span>
              {imageMimeType && (
                <span
                  className="text-[11px]"
                  style={{
                    color: "rgba(255,255,255,0.22)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {imageMimeType}
                </span>
              )}
            </div>

            <div
              className="flex items-center justify-center"
              style={{ height: "208px", background: "#080808" }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pasted preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  className="flex flex-col items-center gap-2.5 text-center"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ border: "1.5px dashed rgba(255,255,255,0.1)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M9 2v10M5.5 5.5L9 2l3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 13v1.5A0.5 0.5 0 003.5 15h11a0.5 0.5 0 00.5-.5V13"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px]">Paste or upload a screenshot</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.14)" }}>
                      ⌘V · Ctrl+V
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis output */}
          <div
            className="flex-1 rounded-xl"
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                className="text-[12px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                AI Analysis
              </span>
              {isAnalyzing && (
                <span
                  className="flex items-center gap-1.5 text-[11px] font-medium"
                  style={{ color: "rgb(251,191,36)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                  Analyzing…
                </span>
              )}
            </div>

            <div className="p-4 min-h-[96px]">
              {isAnalyzing ? (
                <ShimmerLines />
              ) : analysis ? (
                <pre
                  className="max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  {analysis.description}
                </pre>
              ) : (
                <p className="text-[12px] italic" style={{ color: "rgba(255,255,255,0.22)" }}>
                  Analysis will appear after uploading a screenshot.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
