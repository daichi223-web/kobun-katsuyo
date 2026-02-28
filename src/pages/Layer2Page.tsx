import { useState } from "react";
import { TopBar } from "../components/layout/TopBar.tsx";
import { ReadingMode } from "../components/layer1/ReadingMode.tsx";
import { BlankRecall } from "../components/layer1/BlankRecall.tsx";
import { TypeIdentification } from "../components/layer1/TypeIdentification.tsx";

type L2Mode = "reading" | "blank" | "identify";
const MODES: { key: L2Mode; label: string }[] = [
  { key: "reading", label: "音読" },
  { key: "blank", label: "活用テスト" },
  { key: "identify", label: "種類判別" },
];

export function Layer2Page() {
  const [mode, setMode] = useState<L2Mode>("reading");
  return (
    <>
      <TopBar title="古文活用" subtitle="ステップ 2 — 活用形の練習" backTo="/" />
      <div className="sticky top-14 z-40 bg-sumi-dark/95 backdrop-blur-sm px-4 py-2 flex gap-1 justify-center">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`px-4 py-1.5 border rounded text-xs font-semibold transition-all ${
              mode === m.key
                ? "bg-muted text-washi border-muted"
                : "bg-transparent text-muted border-sumi-dark/50 hover:border-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <main className="px-4 py-4">
        {mode === "reading" && <ReadingMode />}
        {mode === "blank" && <BlankRecall />}
        {mode === "identify" && <TypeIdentification />}
      </main>
    </>
  );
}
