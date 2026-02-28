import { useState } from "react";
import { TopBar } from "../components/layout/TopBar.tsx";
import { ThreeColumnTable } from "../components/layer2/ThreeColumnTable.tsx";
import { ConnectionDrill } from "../components/layer2/ConnectionDrill.tsx";
import { NarrowingFlow } from "../components/layer2/NarrowingFlow.tsx";
import { IdentificationDrill } from "../components/layer2/IdentificationDrill.tsx";

type L2Mode = "table" | "connection" | "narrowing" | "identification";

const MODES: { key: L2Mode; label: string }[] = [
  { key: "table", label: "三列表" },
  { key: "connection", label: "即答" },
  { key: "narrowing", label: "絞込" },
  { key: "identification", label: "識別" },
];

export function Layer2Page() {
  const [mode, setMode] = useState<L2Mode>("table");

  return (
    <>
      <TopBar title="古文活用" subtitle="ステップ 2 — 助動詞の習得" backTo="/" />

      {/* Mode nav */}
      <div className="sticky top-14 z-40 bg-sumi-dark/95 backdrop-blur-sm px-4 py-2 flex gap-1 justify-center">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`flex-1 px-3 py-1.5 border rounded text-xs transition-all ${
              mode === m.key
                ? "bg-muted text-washi border-muted"
                : "bg-transparent text-muted border-sumi-dark/50 hover:border-muted"
            }`}
          >
            <span className="font-semibold">{m.label}</span>
          </button>
        ))}
      </div>

      <main className="px-4 py-3">
        {mode === "table" && <ThreeColumnTable />}
        {mode === "connection" && <ConnectionDrill />}
        {mode === "narrowing" && <NarrowingFlow />}
        {mode === "identification" && <IdentificationDrill />}
      </main>
    </>
  );
}
