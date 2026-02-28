import type { LayerId } from "../../types/core.ts";

interface LayerBadgeProps {
  layerId: LayerId;
  unlocked: boolean;
  mastery: number;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export function LayerBadge({
  layerId,
  unlocked,
  mastery,
  title,
  subtitle,
  onClick,
}: LayerBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!unlocked}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        unlocked
          ? "bg-card border-border shadow-sm hover:shadow-md cursor-pointer"
          : "bg-washi/50 border-border/50 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted tracking-wider">{subtitle}</div>
          <div className="text-base font-bold text-sumi-dark mt-0.5">
            {title}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {unlocked ? (
            <>
              <span className="text-sm font-bold text-sumi-dark">
                {mastery}%
              </span>
              <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-kin rounded-full transition-all"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </>
          ) : (
            <span className="text-xs text-muted">
              Layer {layerId - 1} 80%で解放
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
