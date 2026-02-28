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

const TYPE_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "四段活用", label: "四段" },
  { key: "上二段活用", label: "上二段" },
  { key: "下二段活用", label: "下二段" },
  { key: "上一段活用", label: "上一段" },
  { key: "下一段活用", label: "下一段" },
  { key: "カ行変格活用", label: "カ変" },
  { key: "サ行変格活用", label: "サ変" },
  { key: "ナ行変格活用", label: "ナ変" },
  { key: "ラ行変格活用", label: "ラ変" },
];

/** Get unique verbs, optionally filtered by type. */
function getVerbs(typeFilter: string): VerbTypeEntry[] {
  const seen = new Set<string>();
  return VERB_TYPES.filter((v) => {
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

export function ReadingMode() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [verbIdx, setVerbIdx] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [tempo, setTempo] = useState<Tempo>("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allVerbs = getVerbs(typeFilter);
  const verb = allVerbs[verbIdx] ?? allVerbs[0];
  const currentForm = FORMS[focusIdx];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    clearTimer();
    if (focusIdx < FORMS.length - 1) {
      setFocusIdx((i) => i + 1);
    } else {
      setCompleted(true);
      setCompletionCount((c) => c + 1);
    }
  }, [focusIdx, clearTimer]);

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || completed) return;
    const ms = TEMPO_CONFIG.find((t) => t.key === tempo)?.ms ?? 2000;
    timerRef.current = setTimeout(advance, ms);
    return clearTimer;
  }, [autoAdvance, tempo, focusIdx, completed, advance, clearTimer]);

  const handleVerbChange = useCallback(
    (idx: number) => {
      clearTimer();
      setVerbIdx(idx);
      setFocusIdx(0);
      setCompleted(false);
    },
    [clearTimer],
  );

  const handleTypeChange = useCallback(
    (filter: string) => {
      clearTimer();
      setTypeFilter(filter);
      setVerbIdx(0);
      setFocusIdx(0);
      setCompleted(false);
    },
    [clearTimer],
  );

  const handleRestart = useCallback(() => {
    clearTimer();
    setFocusIdx(0);
    setCompleted(false);
  }, [clearTimer]);

  if (!verb) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Type filter */}
      <div className="flex gap-1 flex-wrap justify-center">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => handleTypeChange(f.key)}
            className={`px-2 py-0.5 border rounded text-[10px] transition-all ${
              typeFilter === f.key
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-transparent text-muted border-border hover:border-sumi-dark/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Verb selector */}
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

      {/* All 6 forms displayed at once */}
      <div className="flex flex-col gap-1.5">
        {FORMS.map((form, i) => {
          const formColor = FORM_HEX_MAP[form];
          const isFocused = focusIdx === i && !completed;
          const isPast = i < focusIdx || completed;
          const formInfo = SIX_FORMS_OVERVIEW.find((f) => f.form === form);

          return (
            <button
              key={form}
              type="button"
              onClick={() => {
                if (!completed) {
                  setFocusIdx(i);
                }
              }}
              className={`border-2 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-all ${
                isFocused ? "shadow-sm" : ""
              }`}
              style={{
                borderColor: isFocused ? formColor : isPast ? formColor + "50" : "#e0d8cc",
                backgroundColor: isFocused ? formColor + "12" : "transparent",
                opacity: isPast && !completed ? 0.6 : 1,
              }}
            >
              {/* Form name */}
              <span
                className="text-xs font-bold w-12 shrink-0 text-left"
                style={{ color: formColor }}
              >
                {form}
              </span>

              {/* Conjugated form */}
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-sumi-dark">
                  {verb.stem}
                </span>
                <span
                  className="text-xl font-black"
                  style={{ color: formColor }}
                >
                  {verb.forms[form]}
                </span>
              </div>

              {/* Description */}
              {formInfo && (
                <span className="text-[10px] text-muted ml-auto shrink-0 hidden min-[360px]:inline">
                  {formInfo.desc}
                </span>
              )}

              {/* Focus indicator */}
              {isFocused && (
                <span className="text-xs ml-auto" style={{ color: formColor }}>
                  ◀
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Voice prompt */}
      {!completed && (
        <p className="text-xs text-muted tracking-wider text-center">
          声に出してください — {currentForm}
        </p>
      )}

      {/* Action buttons */}
      {!completed ? (
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={advance}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
          >
            {focusIdx < FORMS.length - 1 ? "次の形 →" : "完了"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center animate-slide-up">
          <span className="text-lg font-bold text-correct">完了!</span>
          <span className="text-xs text-text-secondary">
            {verb.representative}の六活用形を読み上げました（通算 {completionCount} 回）
          </span>
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
    </div>
  );
}
