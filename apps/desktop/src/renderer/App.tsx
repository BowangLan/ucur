import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import {
  createProject,
  createSavedScreen,
  deleteProject,
  deleteSavedScreen,
  describeScreenScreenshot,
  fetchProjects,
  fetchSavedScreens,
  updateSavedScreen,
  type ProjectResponse,
  type SavedScreenResponse,
  type ScreenDescriptionResponse,
} from "./lib/api";
import { AppShell } from "./components/layout/AppShell";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { CreateScreenPage } from "./pages/screens/CreateScreenPage";
import { ScreenDetailPage } from "./pages/screens/ScreenDetailPage";
import { ScreensGridPage } from "./pages/screens/ScreensGridPage";
import type { AppView, ProjectItem, ScreenItem } from "./types/screens";
import { extractBase64, fileToDataUrl, normalizeForVisionModel } from "./utils/image";

export default function App() {
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
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
    projectId: screen.projectId,
    projectName: screen.projectName,
    projectDescription: screen.projectDescription,
    projectWorkingDirectory: screen.projectWorkingDirectory,
    name: screen.name,
    notes: screen.notes,
    createdAt: screen.createdAt,
    previewUrl: screen.previewUrl,
    analysis: screen.analysis,
    analysisStatus: screen.analysisStatus,
    analysisError: screen.analysisError,
  });

  const toProjectItem = (project: ProjectResponse): ProjectItem => ({
    id: project.id,
    name: project.name,
    description: project.description,
    workingDirectory: project.workingDirectory,
    screenCount: project.screenCount,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });

  useEffect(() => {
    let disposed = false;

    void (async () => {
      try {
        const [savedScreens, savedProjects] = await Promise.all([
          fetchSavedScreens(),
          fetchProjects(),
        ]);
        if (disposed) return;

        const mappedProjects = savedProjects.map(toProjectItem);
        setProjects(mappedProjects);
        setScreens(savedScreens.map(toScreenItem));

        if (mappedProjects.length > 0) {
          setSelectedProjectId((current) => current ?? mappedProjects[0].id);
        }
      } catch (err) {
        if (disposed) return;
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
      }
    })();

    return () => {
      disposed = true;
    };
  }, []);

  const filteredScreens = useMemo(() => {
    if (!selectedProjectId) return screens;
    return screens.filter((screen) => screen.projectId === selectedProjectId);
  }, [screens, selectedProjectId]);

  const activeScreen = useMemo(() => {
    if (view.type !== "detail") return null;
    return screens.find((screen) => screen.id === view.screenId) ?? null;
  }, [screens, view]);

  const activeProject = useMemo(() => {
    if (view.type !== "project-detail") return null;
    return projects.find((project) => project.id === view.projectId) ?? null;
  }, [projects, view]);

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
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
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

  const createNewProject = async (payload: {
    name: string;
    description: string;
    workingDirectory: string;
  }) => {
    const created = await createProject({
      name: payload.name,
      description: payload.description,
      workingDirectory: payload.workingDirectory || undefined,
    });

    const item = toProjectItem(created);
    setProjects((current) => [item, ...current]);
    setSelectedProjectId(item.id);
    setError(null);
  };

  const removeProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects((current) => {
        const remaining = current.filter((project) => project.id !== projectId);
        if (selectedProjectId === projectId) {
          setSelectedProjectId(remaining[0]?.id ?? null);
        }
        return remaining;
      });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
    }
  };

  const createScreen = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Screen name is required.");
      return;
    }
    if (!selectedProjectId) {
      setError("Select a project before saving a screen.");
      return;
    }

    try {
      const saved = await createSavedScreen({
        projectId: selectedProjectId,
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
      setProjects((current) =>
        current.map((project) =>
          project.id === selectedProjectId
            ? { ...project, screenCount: project.screenCount + 1 }
            : project,
        ),
      );

      if (isAnalyzing && activeAnalyzeRequestIdRef.current !== null) {
        pendingAnalyzeTargetByRequestRef.current.set(activeAnalyzeRequestIdRef.current, newScreen.id);
      }

      setView({ type: "detail", screenId: newScreen.id });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save screen";
      setError(message);
    }
  };

  const deleteScreen = async (screenId: string) => {
    const target = screens.find((screen) => screen.id === screenId);

    try {
      await deleteSavedScreen(screenId);
      setScreens((current) => current.filter((screen) => screen.id !== screenId));
      if (target) {
        setProjects((current) =>
          current.map((project) =>
            project.id === target.projectId
              ? { ...project, screenCount: Math.max(0, project.screenCount - 1) }
              : project,
          ),
        );
      }
      setError(null);
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
      onShowProjects={() => setView({ type: "projects" })}
      onShowScreens={() => setView({ type: "screens" })}
      onCreateScreen={beginCreate}
    >
      {view.type === "projects" && (
        <ProjectsPage
          projects={projects}
          selectedProjectId={selectedProjectId}
          error={error}
          onSelectProject={setSelectedProjectId}
          onOpenProject={(projectId) => setView({ type: "project-detail", projectId })}
          onCreateProject={createNewProject}
          onDeleteProject={removeProject}
        />
      )}

      {view.type === "project-detail" && (
        <ProjectDetailPage
          project={activeProject}
          screens={screens.filter((screen) => screen.projectId === view.projectId)}
          onBack={() => setView({ type: "projects" })}
          onOpenScreen={(screenId) => setView({ type: "detail", screenId })}
        />
      )}

      {view.type === "screens" && (
        <ScreensGridPage
          screens={filteredScreens}
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
          projects={projects}
          selectedProjectId={selectedProjectId}
          name={name}
          notes={notes}
          previewUrl={previewUrl}
          analysis={analysis}
          imageMimeType={imageMimeType}
          isAnalyzing={isAnalyzing}
          error={error}
          onProjectChange={setSelectedProjectId}
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
