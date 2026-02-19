import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { fetchConversation } from "../lib/api";

const API_BASE = "http://localhost:3001/api";

interface ChatProps {
  conversationId: string;
}

export function Chat({ conversationId }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, append, status, error, setMessages } = useChat({
    api: `${API_BASE}/chat`,
    id: conversationId,
    body: { conversationId },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchConversation(conversationId).then((data) => {
      const loaded = data.messages.map(
        (m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          parts: [{ type: "text" as const, text: m.content }],
        })
      );
      setMessages(loaded);
    }).catch(() => setMessages([]));
  }, [conversationId, setMessages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    append({ role: "user", content: input }, { body: { conversationId } });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Type a message below to begin</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-emerald-600/80 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.parts
                  ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p, i) => (
                    <span key={i}>{p.text}</span>
                  ))}
              </div>
            </div>
          </div>
        ))}
        {(status === "submitted" || status === "streaming") && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl px-4 py-2.5 text-zinc-400 animate-pulse">
              ●●●
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-500/20 text-red-400 px-4 py-2 text-sm">
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={onSubmit}
        className="p-4 border-t border-zinc-800 bg-zinc-900/50"
      >
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            disabled={status !== "ready"}
            className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || status !== "ready"}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
