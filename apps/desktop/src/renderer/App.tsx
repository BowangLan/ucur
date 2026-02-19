import { useEffect, useState } from "react";
import { Chat } from "./components/Chat";
import { Sidebar } from "./components/Sidebar";
import { Settings } from "./components/Settings";
import { useConversationsStore } from "./stores/useConversationsStore";
import { useSettingsStore } from "./stores/useSettingsStore";

export default function App() {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [showSettings, setShowSettings] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [attemptedAutoCreate, setAttemptedAutoCreate] = useState(false);
  const {
    conversations,
    loading,
    hasLoaded,
    error,
    loadConversations,
    createConversation,
  } = useConversationsStore();
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setInitError(null);
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (
      !conversations.length &&
      !currentConversationId &&
      hasLoaded &&
      !loading &&
      !attemptedAutoCreate
    ) {
      setAttemptedAutoCreate(true);
      createConversation()
        .then((conv) => {
          setInitError(null);
          setCurrentConversationId(conv.id);
        })
        .catch((err) => {
          setInitError(
            err instanceof Error ? err.message : "Failed to create conversation"
          );
        });
    }
  }, [
    conversations.length,
    currentConversationId,
    hasLoaded,
    loading,
    attemptedAutoCreate,
    createConversation,
  ]);

  const handleRetry = () => {
    setInitError(null);
    setAttemptedAutoCreate(false);
    void loadConversations();
  };

  const handleNewChat = async () => {
    try {
      const conv = await createConversation();
      setInitError(null);
      setCurrentConversationId(conv.id);
    } catch (err) {
      setInitError(
        err instanceof Error ? err.message : "Failed to create conversation"
      );
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewChat={handleNewChat}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {showSettings ? (
          <Settings onClose={() => setShowSettings(false)} />
        ) : currentConversationId ? (
          <Chat conversationId={currentConversationId} />
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Loading...
          </div>
        ) : error || initError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 space-y-3">
              <p className="font-medium text-red-300">Unable to initialize chat</p>
              <p>{initError ?? error}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-zinc-100 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="rounded-md border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-zinc-200 transition-colors"
                >
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Loading...
          </div>
        )}
      </main>
    </div>
  );
}
