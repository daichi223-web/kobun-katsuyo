import { useState, useCallback } from "react";
import { TopBar } from "../components/layout/TopBar.tsx";
import { IntroPhase } from "../components/layer0/IntroPhase.tsx";
import { AnimationPhase } from "../components/layer0/AnimationPhase.tsx";
import { PairsPhase } from "../components/layer0/PairsPhase.tsx";
import { SummaryPhase } from "../components/layer0/SummaryPhase.tsx";
import { useProgress } from "../hooks/useProgress.ts";
import { PHASE_LABELS } from "../data/constants.ts";
import type { L0Phase } from "../types/core.ts";

const PHASES: L0Phase[] = ["intro", "animation", "pairs", "summary"];

export function Layer0Page() {
  const [phase, setPhase] = useState<L0Phase>("intro");
  const { updateLayer } = useProgress();
  const phaseIdx = PHASES.indexOf(phase);

  const handleComplete = useCallback(async () => {
    await updateLayer(0, { mastery: 100, completed: true });
  }, [updateLayer]);

  return (
    <>
      <TopBar
        title="古文活用"
        subtitle="Layer 0 — 活用とは"
        backTo="/"
      />

      {/* Phase nav */}
      <div className="sticky top-14 z-40 bg-sumi-dark/95 backdrop-blur-sm px-4 py-2 flex gap-1 justify-center">
        {PHASE_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setPhase(PHASES[i])}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 border rounded text-xs transition-all ${
              phaseIdx === i
                ? "bg-muted text-washi border-muted"
                : "bg-transparent text-muted border-sumi-dark/50 hover:border-muted"
            }`}
          >
            <span className="text-[10px] opacity-70">{i + 1}</span>
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <main className="px-4 py-4">
        {phase === "intro" && (
          <IntroPhase onNext={() => setPhase("animation")} />
        )}
        {phase === "animation" && <AnimationPhase />}
        {phase === "pairs" && <PairsPhase />}
        {phase === "summary" && <SummaryPhase onComplete={handleComplete} />}
      </main>
    </>
  );
}
