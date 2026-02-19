import { useEffect, useState } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";
import {
  updateSettings,
  fetchAccount,
  fetchSettingsModels,
  type SettingsModelOption,
} from "../lib/api";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { model, theme, loadSettings, updateSettings: updateStore } =
    useSettingsStore();
  const [modelInput, setModelInput] = useState(model);
  const [themeInput, setThemeInput] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modelOptions, setModelOptions] = useState<SettingsModelOption[]>([]);
  const [modelOptionsLoading, setModelOptionsLoading] = useState(false);
  const [modelOptionsError, setModelOptionsError] = useState<string | null>(null);
  const [account, setAccount] = useState<{ email?: string; organization?: string } | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setModelInput(model);
    setThemeInput(theme);
  }, [model, theme]);

  useEffect(() => {
    fetchAccount()
      .then(setAccount)
      .catch((err) => setAccountError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  useEffect(() => {
    setModelOptionsLoading(true);
    fetchSettingsModels()
      .then((models) => {
        setModelOptions(models);
        setModelOptionsError(null);
      })
      .catch((err) =>
        setModelOptionsError(
          err instanceof Error ? err.message : "Failed to load model options"
        )
      )
      .finally(() => setModelOptionsLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { model: modelInput, theme: themeInput };
      await updateSettings(payload);
      updateStore(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold">Settings</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          ← Back
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 max-w-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Account (Claude Code)
            </label>
            {account ? (
              <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3 text-zinc-200 text-sm">
                {account.email && <p>{account.email}</p>}
                {account.organization && <p className="text-zinc-400">{account.organization}</p>}
                {!account.email && !account.organization && (
                  <p className="text-zinc-400">Signed in via Claude Code</p>
                )}
              </div>
            ) : accountError ? (
              <p className="text-sm text-amber-500">{accountError}</p>
            ) : (
              <p className="text-sm text-zinc-500">Loading…</p>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              Auth is managed by Claude Code. Sign in via the Claude Code app.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Model
            </label>
            <select
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              disabled={modelOptionsLoading || modelOptions.length === 0}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {modelOptions.length === 0 ? (
                <option value={modelInput}>
                  {modelOptionsLoading ? "Loading models..." : modelInput}
                </option>
              ) : (
                <>
                  {!modelOptions.some((model) => model.value === modelInput) && (
                    <option value={modelInput}>
                      {modelInput} (current)
                    </option>
                  )}
                  {modelOptions.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.displayName}
                    </option>
                  ))}
                </>
              )}
            </select>
            {modelOptionsError && (
              <p className="mt-1 text-xs text-amber-500">{modelOptionsError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Theme
            </label>
            <select
              value={themeInput}
              onChange={(e) =>
                setThemeInput(e.target.value as "light" | "dark" | "system")
              }
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
