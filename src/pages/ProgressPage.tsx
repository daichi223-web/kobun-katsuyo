import { TopBar } from "../components/layout/TopBar.tsx";
import { MasteryBar } from "../components/shared/MasteryBar.tsx";
import { useProgress } from "../hooks/useProgress.ts";
import { LAYER_DEFINITIONS } from "../data/layer-definitions.ts";
import { getMasteryLabel } from "../engine/mastery.ts";
import type { LayerId } from "../types/core.ts";

export function ProgressPage() {
  const { progress, loading } = useProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted text-sm">読み込み中...</span>
      </div>
    );
  }

  return (
    <>
      <TopBar title="古文活用" subtitle="進捗" />
      <main className="px-4 py-4 flex flex-col gap-3">
        {/* Streak */}
        <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
          <span className="text-xl">🔥</span>
          <div>
            <span className="text-lg font-bold text-sumi-dark">
              {progress?.streak ?? 0}日
            </span>
            <span className="text-xs text-muted ml-1">連続</span>
          </div>
        </div>

        {/* Layer progress */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs text-muted tracking-widest">レイヤー別習熟度</h2>
          {LAYER_DEFINITIONS.map((layer) => {
            const key = `layer${layer.id}` as `layer${LayerId}`;
            const lp = progress?.layers[key];
            const mastery = lp?.mastery ?? 0;

            return (
              <div
                key={layer.id}
                className="bg-card border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-[10px] text-muted tracking-wider">
                      {layer.subtitle}
                    </span>
                    <span className="text-sm font-bold text-sumi-dark ml-1.5">
                      {layer.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted">
                    {getMasteryLabel(mastery)}
                  </span>
                </div>
                <MasteryBar mastery={mastery} />
              </div>
            );
          })}
        </div>

        {/* Session history */}
        {progress && progress.sessionHistory.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs text-muted tracking-widest">学習履歴</h2>
            {progress.sessionHistory.slice(-5).reverse().map((s, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm text-sumi-dark">{s.date}</span>
                  <span className="text-xs text-muted ml-2">{s.layer}</span>
                </div>
                <span className="text-sm font-bold text-sumi-dark">
                  {s.correct}/{s.total}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Weak items */}
        {progress && progress.weakItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs text-muted tracking-widest">苦手項目</h2>
            <div className="flex flex-wrap gap-1.5">
              {progress.weakItems.map((item) => (
                <span
                  key={item}
                  className="bg-shu/10 text-shu border border-shu/30 rounded-full px-2.5 py-0.5 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
