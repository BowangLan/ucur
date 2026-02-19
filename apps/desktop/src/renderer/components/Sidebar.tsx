import { useConversationsStore } from "../stores/useConversationsStore";

interface SidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onOpenSettings,
}: SidebarProps) {
  const { conversations, loading, deleteConversation } = useConversationsStore();

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/50">
      <div className="p-3 border-b border-zinc-800">
        <button
          onClick={handleNewChat}
          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-zinc-500 text-sm py-4 text-center">
            Loading...
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  onClick={() => onSelectConversation(c.id)}
                  className={`flex-1 text-left py-2 px-3 rounded-lg truncate text-sm transition-colors ${
                    currentConversationId === c.id
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {c.title}
                </button>
                <button
                  onClick={() => deleteConversation(c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all"
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={onOpenSettings}
          className="w-full py-2 px-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-sm transition-colors"
        >
          ⚙ Settings
        </button>
      </div>
    </aside>
  );
}
