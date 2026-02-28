import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar.tsx";
import { OverviewPhase } from "../components/layer1-types/OverviewPhase.tsx";
import { MemorizePhase } from "../components/layer1-types/MemorizePhase.tsx";
import { SummaryPhase } from "../components/layer1-types/SummaryPhase.tsx";
import { useProgress } from "../hooks/useProgress.ts";

type L1Phase = "overview" | "memorize" | "summary";

const PHASE_LABELS: { key: L1Phase; label: string }[] = [
  { key: "overview", label: "一覧" },
  { key: "memorize", label: "暗記" },
  { key: "summary", label: "まとめ" },
];

export function Layer1Page() {
  const [phase, setPhase] = useState<L1Phase>("overview");
  const { updateLayer } = useProgress();
  const navigate = useNavigate();

  const handleComplete = useCallback(async () => {
    await updateLayer(1, { mastery: 100, completed: true });
    navigate("/");
  }, [updateLayer, navigate]);

  return (
    <>
      <TopBar title="古文活用" subtitle="ステップ 1 — 活用の種類" backTo="/" />

      {/* Phase nav */}
      <div className="sticky top-14 z-40 bg-sumi-dark/95 backdrop-blur-sm px-4 py-2 flex gap-1 justify-center">
        {PHASE_LABELS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPhase(p.key)}
            className={`px-4 py-1.5 border rounded text-xs font-semibold transition-all ${
              phase === p.key
                ? "bg-muted text-washi border-muted"
                : "bg-transparent text-muted border-sumi-dark/50 hover:border-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <main className="px-4 py-4">
        {phase === "overview" && (
          <OverviewPhase onNext={() => setPhase("memorize")} />
        )}
        {phase === "memorize" && (
          <MemorizePhase onNext={() => setPhase("summary")} />
        )}
        {phase === "summary" && (
          <SummaryPhase onComplete={handleComplete} />
        )}
      </main>
    </>
  );
}
