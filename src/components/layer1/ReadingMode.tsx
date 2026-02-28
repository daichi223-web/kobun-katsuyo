import { useState, useCallback, useEffect, useRef } from "react";
import { VERB_TYPES, type VerbTypeEntry } from "../../data/verb-types.ts";
import { FORM_HEX_MAP, SIX_FORMS_OVERVIEW } from "../../data/constants.ts";
import type { VerbForm } from "../../types/core.ts";

const FORMS: VerbForm[] = [
  "未然形",
  "連用形",
  "終止形",
  "連体形",
  "已然形",
  "命令形",
];

type Tempo = "slow" | "normal" | "fast";
const TEMPO_CONFIG: { key: Tempo; label: string; ms: number }[] = [
  { key: "slow", label: "遅", ms: 3000 },
  { key: "normal", label: "普通", ms: 2000 },
  { key: "fast", label: "速", ms: 1000 },
];

/** Group verb types by conjugation type for the selector. */
function uniqueTypes(): VerbTypeEntry[] {
  const seen = new Set<string>();
  return VERB_TYPES.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

export function ReadingMode() {
  const allVerbs = uniqueTypes();
  const [verbIdx, setVerbIdx] = useState(0);
  const [formIdx, setFormIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [tempo, setTempo] = useState<Tempo>("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verb = allVerbs[verbIdx];
  const currentForm = FORMS[formIdx];
  const formColor = FORM_HEX_MAP[currentForm];
  const formInfo = SIX_FORMS_OVERVIEW.find((f) => f.form === currentForm);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    clearTimer();
    if (formIdx < FORMS.length - 1) {
      setFormIdx((i) => i + 1);
    } else {
      setCompleted(true);
      setCompletionCount((c) => c + 1);
    }
  }, [formIdx, clearTimer]);

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || completed) return;
    const ms = TEMPO_CONFIG.find((t) => t.key === tempo)?.ms ?? 2000;
    timerRef.current = setTimeout(advance, ms);
    return clearTimer;
  }, [autoAdvance, tempo, formIdx, completed, advance, clearTimer]);

  const handleVerbChange = useCallback(
    (idx: number) => {
      clearTimer();
      setVerbIdx(idx);
      setFormIdx(0);
      setCompleted(false);
    },
    [clearTimer],
  );

  const handleRestart = useCallback(() => {
    clearTimer();
    setFormIdx(0);
    setCompleted(false);
  }, [clearTimer]);

  return (
    <div className="flex flex-col gap-3">
      {/* Verb type selector */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {allVerbs.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => handleVerbChange(i)}
            className={`px-2.5 py-1 border rounded text-xs transition-all ${
              verbIdx === i
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border hover:border-sumi-dark/50"
            }`}
          >
            {v.representative}
          </button>
        ))}
      </div>

      {/* Verb info header */}
      <div className="text-center">
        <span className="text-xs text-muted tracking-wider">
          {verb.type} {verb.row}
        </span>
      </div>

      {/* Main display card */}
      {!completed ? (
        <div
          className="bg-card border-2 rounded-xl px-4 py-5 shadow-sm flex flex-col gap-3 items-center animate-fade-in"
          style={{ borderColor: formColor }}
          key={`${verb.id}-${formIdx}`}
        >
          {/* Form name */}
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold tracking-wider"
              style={{ color: formColor }}
            >
              {currentForm}
            </span>
            <span className="text-xs text-muted">
              {formIdx + 1} / {FORMS.length}
            </span>
          </div>

          {/* Large conjugation display */}
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-sumi-dark">
              {verb.stem}
            </span>
            <span
              className="text-3xl font-black"
              style={{ color: formColor }}
            >
              {verb.forms[currentForm]}
            </span>
          </div>

          {/* Function description */}
          {formInfo && (
            <div
              className="rounded-lg px-3 py-1.5 text-xs text-center"
              style={{
                backgroundColor: formColor + "12",
                color: formColor,
              }}
            >
              {formInfo.desc} -- {formInfo.acc}
            </div>
          )}

          {/* Voice prompt */}
          <p className="text-xs text-muted tracking-wider">
            声に出してください
          </p>

          {/* Advance button */}
          <button
            type="button"
            onClick={advance}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
          >
            {formIdx < FORMS.length - 1 ? "次の形 →" : "完了"}
          </button>
        </div>
      ) : (
        /* Completion card */
        <div className="bg-card border border-correct rounded-xl px-4 py-5 shadow-sm flex flex-col gap-3 items-center animate-slide-up">
          <span className="text-lg font-bold text-correct">完了!</span>
          <span className="text-xs text-text-secondary">
            {verb.representative}の六活用形を読み上げました
          </span>
          <div className="text-xs text-muted">
            通算 {completionCount} 回完了
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="text-text-secondary border border-border px-3 py-1.5 rounded-md text-sm"
            >
              もう一度
            </button>
            <button
              type="button"
              onClick={() => {
                handleVerbChange((verbIdx + 1) % allVerbs.length);
              }}
              className="bg-sumi-dark text-washi px-4 py-1.5 rounded-md text-sm"
            >
              次の動詞 →
            </button>
          </div>
        </div>
      )}

      {/* Tempo / auto-advance controls */}
      <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm flex items-center justify-between gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
            className="accent-sumi-dark w-3.5 h-3.5"
          />
          <span className="text-xs text-text-secondary">自動送り</span>
        </label>

        <div className="flex gap-1">
          {TEMPO_CONFIG.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTempo(t.key)}
              disabled={!autoAdvance}
              className={`px-2.5 py-1 border rounded text-xs transition-all ${
                tempo === t.key && autoAdvance
                  ? "bg-sumi-dark text-washi border-sumi-dark"
                  : "bg-transparent text-muted border-border disabled:opacity-40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mini form overview strip */}
      {!completed && (
        <div className="flex gap-1 justify-center">
          {FORMS.map((f, i) => {
            const c = FORM_HEX_MAP[f];
            return (
              <div
                key={f}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i <= formIdx ? c : c + "30",
                  transform: i === formIdx ? "scale(1.4)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
