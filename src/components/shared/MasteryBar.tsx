import { getMasteryLabel } from "../../engine/mastery.ts";

interface MasteryBarProps {
  mastery: number;
  showLabel?: boolean;
}

export function MasteryBar({ mastery, showLabel = true }: MasteryBarProps) {
  const barColor =
    mastery >= 80
      ? "bg-correct"
      : mastery >= 60
        ? "bg-form-izen"
        : mastery > 0
          ? "bg-form-mizen"
          : "bg-border";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${mastery}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted whitespace-nowrap">
          {mastery}% {getMasteryLabel(mastery)}
        </span>
      )}
    </div>
  );
}
