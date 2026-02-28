import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar.tsx";
import { LayerBadge } from "../components/shared/LayerBadge.tsx";
import { useProgress } from "../hooks/useProgress.ts";
import { useLayerUnlock } from "../hooks/useLayerUnlock.ts";
import { LAYER_DEFINITIONS } from "../data/layer-definitions.ts";
import type { LayerId } from "../types/core.ts";

export function HomePage() {
  const { progress, loading } = useProgress();
  const unlocked = useLayerUnlock(progress);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted text-sm">読み込み中...</span>
      </div>
    );
  }

  const streak = progress?.streak ?? 0;

  return (
    <>
      <TopBar />
      <main className="px-4 py-4 flex flex-col gap-3">
        {/* Streak */}
        {streak > 0 && (
          <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-bold text-sumi-dark">
              {streak}日連続学習中
            </span>
          </div>
        )}

        {/* Layer map */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs text-muted tracking-widest">学習レイヤー</h2>
          {LAYER_DEFINITIONS.map((layer) => {
            const key = `layer${layer.id}` as `layer${LayerId}`;
            const mastery = progress?.layers[key].mastery ?? 0;

            return (
              <LayerBadge
                key={layer.id}
                layerId={layer.id}
                unlocked={unlocked[layer.id]}
                mastery={mastery}
                title={layer.title}
                subtitle={layer.subtitle}
                onClick={() => {
                  if (unlocked[layer.id]) {
                    navigate(`/layer/${layer.id}`);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Core message */}
        <div className="bg-washi border border-border rounded-lg p-3">
          <p className="text-xs text-muted leading-relaxed tracking-wide">
            活用表は「暗記する表」ではない。後ろの語への応答パターンだ。
          </p>
        </div>
      </main>
    </>
  );
}
