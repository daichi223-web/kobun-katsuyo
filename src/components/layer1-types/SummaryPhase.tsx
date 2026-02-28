import { useState, useCallback } from "react";

interface SummaryPhaseProps {
  onComplete: () => void;
}

const CAN_DO = [
  "「活用の種類は全部で9種」と言える",
  "上一段の動詞を「ひいきにみゐる」で全部言える",
  "変格活用4種（カサナラ）の代表動詞を言える",
  "「四段・上二・下二は数が多いからパターンで見分ける」と説明できる",
];

const NOT_YET = [
  "上一段と上二段の違いが言えない",
  "ラ変の動詞が「あり」しか出てこない",
  "変格活用が何種類あるか曖昧",
];

export function SummaryPhase({ onComplete }: SummaryPhaseProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = useCallback((idx: number) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-sumi-dark tracking-wider text-center">
        活用の種類 — まとめ
      </h2>

      {/* Can do checklist */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-correct font-bold tracking-wider">
          理解できたサイン
        </span>
        {CAN_DO.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`w-full text-left border rounded-lg px-3 py-2.5 flex items-start gap-2 transition-all ${
              checked[i]
                ? "bg-correct/10 border-correct"
                : "bg-card border-border"
            }`}
          >
            <span className={`text-sm shrink-0 mt-0.5 ${checked[i] ? "text-correct" : "text-muted"}`}>
              {checked[i] ? "✓" : "○"}
            </span>
            <span className="text-sm text-sumi-dark">{item}</span>
          </button>
        ))}
      </div>

      {/* Not yet signs */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-incorrect font-bold tracking-wider">
          まだのサイン — 当てはまったら暗記ドリルに戻ろう
        </span>
        {NOT_YET.map((item, i) => (
          <div
            key={i}
            className="bg-washi border border-border rounded-lg px-3 py-2 flex items-start gap-2"
          >
            <span className="text-sm text-incorrect shrink-0 mt-0.5">△</span>
            <span className="text-sm text-text-secondary">{item}</span>
          </div>
        ))}
      </div>

      {/* Completion */}
      <div className="text-center text-xs text-muted">
        {checkedCount}/{CAN_DO.length} 確認済み
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="bg-sumi-dark text-washi px-6 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
      >
        ステップ1 完了 →
      </button>
    </div>
  );
}
