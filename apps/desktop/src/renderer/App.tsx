import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import {
  createSavedScreen,
  deleteSavedScreen,
  describeScreenScreenshot,
  fetchSavedScreens,
  updateSavedScreen,
  type SavedScreenResponse,
  type ScreenDescriptionResponse,
} from "./lib/api";
import { AppShell } from "./components/layout/AppShell";
import { CreateScreenPage } from "./pages/screens/CreateScreenPage";
import { ScreenDetailPage } from "./pages/screens/ScreenDetailPage";
import { ScreensGridPage } from "./pages/screens/ScreensGridPage";
import type { AppView, ScreenItem } from "./types/screens";
import { extractBase64, fileToDataUrl, normalizeForVisionModel } from "./utils/image";

export default function App() {
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [view, setView] = useState<AppView>({ type: "screens" });

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScreenDescriptionResponse | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAnalyzeRequestIdRef = useRef<number | null>(null);
  const analyzeRequestCounterRef = useRef(0);
  const pendingAnalyzeTargetByRequestRef = useRef<Map<number, string>>(new Map());

  const toScreenItem = (screen: SavedScreenResponse): ScreenItem => ({
    id: screen.id,
    name: screen.name,
    notes: screen.notes,
    createdAt: screen.createdAt,
    previewUrl: screen.previewUrl,
    analysis: screen.analysis,
    analysisStatus: screen.analysisStatus,
    analysisError: screen.analysisError,
  });

  useEffect(() => {
    let disposed = false;

    void (async () => {
      try {
        const data = await fetchSavedScreens();
        if (disposed) return;
        setScreens(data.map(toScreenItem));
      } catch (err) {
        if (disposed) return;
        const message = err instanceof Error ? err.message : "Failed to fetch saved screens";
        setError(message);
      }
    })();

    return () => {
      disposed = true;
    };
  }, []);

  const activeScreen = useMemo(() => {
    if (view.type !== "detail") return null;
    return screens.find((screen) => screen.id === view.screenId) ?? null;
  }, [screens, view]);

  const resetCreateState = () => {
    setName("");
    setNotes("");
    setPreviewUrl(null);
    setAnalysis(null);
    setImageMimeType(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const beginCreate = () => {
    resetCreateState();
    setView({ type: "create" });
  };

  const analyzeFile = async (file: File) => {
    if (isAnalyzing) return;

    const requestId = analyzeRequestCounterRef.current + 1;
    analyzeRequestCounterRef.current = requestId;
    activeAnalyzeRequestIdRef.current = requestId;

    setError(null);
    setAnalysis(null);
    setImageMimeType(file.type);
    setIsAnalyzing(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);

      let payload: { imageMimeType: string; imageBase64: string };
      try {
        payload = await normalizeForVisionModel(dataUrl);
      } catch {
        payload = {
          imageMimeType: file.type,
          imageBase64: extractBase64(dataUrl),
        };
      }

      const response = await describeScreenScreenshot(payload);
      setAnalysis(response);
      const targetScreenId = pendingAnalyzeTargetByRequestRef.current.get(requestId);
      if (targetScreenId) {
        await updateSavedScreen(targetScreenId, {
          analysis: response.description,
          analysisStatus: "completed",
          analysisError: null,
        });
        setScreens((current) =>
          current.map((screen) =>
            screen.id === targetScreenId
              ? {
                  ...screen,
                  analysis: response.description,
                  analysisStatus: "completed",
                  analysisError: undefined,
                }
              : screen,
          ),
        );
        pendingAnalyzeTargetByRequestRef.current.delete(requestId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze screenshot";
      setError(message);
      const targetScreenId = pendingAnalyzeTargetByRequestRef.current.get(requestId);
      if (targetScreenId) {
        await updateSavedScreen(targetScreenId, {
          analysisStatus: "failed",
          analysisError: message,
        }).catch(() => {});
        setScreens((current) =>
          current.map((screen) =>
            screen.id === targetScreenId
              ? {
                  ...screen,
                  analysisStatus: "failed",
                  analysisError: message,
                }
              : screen,
          ),
        );
        pendingAnalyzeTargetByRequestRef.current.delete(requestId);
      }
    } finally {
      setIsAnalyzing(false);
      if (activeAnalyzeRequestIdRef.current === requestId) {
        activeAnalyzeRequestIdRef.current = null;
      }
    }
  };

  const handlePasteImage = async (event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items?.length) return;

    const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    await analyzeFile(file);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await analyzeFile(file);
    event.target.value = "";
  };

  const createScreen = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Screen name is required.");
      return;
    }

    try {
      const saved = await createSavedScreen({
        name: trimmedName,
        notes: notes.trim(),
        previewUrl: previewUrl ?? undefined,
        analysis: analysis?.description,
        analysisStatus: isAnalyzing
          ? "processing"
          : analysis
            ? "completed"
            : error
              ? "failed"
              : "idle",
        analysisError: error ?? undefined,
      });

      const newScreen = toScreenItem(saved);
      setScreens((current) => [newScreen, ...current]);

      if (isAnalyzing && activeAnalyzeRequestIdRef.current !== null) {
        pendingAnalyzeTargetByRequestRef.current.set(activeAnalyzeRequestIdRef.current, newScreen.id);
      }

      setView({ type: "detail", screenId: newScreen.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save screen";
      setError(message);
    }
  };

  const deleteScreen = async (screenId: string) => {
    try {
      await deleteSavedScreen(screenId);
      setScreens((current) => current.filter((screen) => screen.id !== screenId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete screen";
      setError(message);
      return;
    }

    if (view.type === "detail" && view.screenId === screenId) {
      setView({ type: "screens" });
    }
  };

  return (
    <AppShell
      viewType={view.type}
      onShowScreens={() => setView({ type: "screens" })}
      onCreateScreen={beginCreate}
    >
      {view.type === "screens" && (
        <ScreensGridPage
          screens={screens}
          onOpenScreen={(screenId) => setView({ type: "detail", screenId })}
          onDeleteScreen={deleteScreen}
        />
      )}

      {view.type === "detail" && (
        <ScreenDetailPage
          screen={activeScreen}
          onBackToScreens={() => setView({ type: "screens" })}
          onDeleteScreen={deleteScreen}
        />
      )}

      {view.type === "create" && (
        <CreateScreenPage
          name={name}
          notes={notes}
          previewUrl={previewUrl}
          analysis={analysis}
          imageMimeType={imageMimeType}
          isAnalyzing={isAnalyzing}
          error={error}
          onNameChange={setName}
          onNotesChange={setNotes}
          onFileSelect={handleFileSelect}
          onPasteImage={handlePasteImage}
          onCancel={() => setView({ type: "screens" })}
          onSave={createScreen}
        />
      )}
    </AppShell>
  );
}
