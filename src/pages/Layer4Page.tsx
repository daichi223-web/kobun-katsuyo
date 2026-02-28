import { useState } from "react";
import { TopBar } from "../components/layout/TopBar.tsx";
import { MorphemeAnalysis } from "../components/layer3/MorphemeAnalysis.tsx";
import { TranslationMode } from "../components/layer3/TranslationMode.tsx";

type L4Mode = "analysis" | "translation";
const MODES: { key: L4Mode; label: string }[] = [
  { key: "analysis", label: "品詞分解" },
  { key: "translation", label: "訳出" },
];

export function Layer4Page() {
  const [mode, setMode] = useState<L4Mode>("analysis");

  return (
    <>
      <TopBar title="古文活用" subtitle="ステップ 4 — 一文精読" backTo="/" />
      <main className="px-4 py-3 flex flex-col gap-3">
        {/* Mode tabs */}
        <div className="flex gap-1.5 bg-card border border-border rounded-lg p-1 shadow-sm">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`flex-1 py-1.5 rounded-md text-sm font-bold tracking-wider transition-all ${
                mode === m.key
                  ? "bg-sumi-dark text-washi shadow-sm"
                  : "text-text-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Active mode */}
        {mode === "analysis" && <MorphemeAnalysis />}
        {mode === "translation" && <TranslationMode />}
      </main>
    </>
  );
}
