import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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

type FieldStatus = "pending" | "correct" | "incorrect";

interface FieldState {
  value: string;
  status: FieldStatus;
}

function getFilteredVerbs(typeFilter: string): VerbTypeEntry[] {
  if (typeFilter === "all") return VERB_TYPES;
  return VERB_TYPES.filter((v) => v.type === typeFilter);
}

function pickRandom(candidates: VerbTypeEntry[], exclude?: string): VerbTypeEntry {
  const filtered = exclude
    ? candidates.filter((v) => v.id !== exclude)
    : candidates;
  const pool = filtered.length > 0 ? filtered : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function createEmptyFields(): Record<VerbForm, FieldState> {
  return Object.fromEntries(
    FORMS.map((f) => [f, { value: "", status: "pending" as FieldStatus }]),
  ) as Record<VerbForm, FieldState>;
}

export function BlankRecall() {
  const [typeFilter, setTypeFilter] = useState("all");
  const candidates = useMemo(() => getFilteredVerbs(typeFilter), [typeFilter]);
  const [verb, setVerb] = useState<VerbTypeEntry>(() => pickRandom(candidates));
  const [fields, setFields] = useState<Record<VerbForm, FieldState>>(() =>
    createEmptyFields(),
  );
  const [judged, setJudged] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const firstRetryRef = useRef<VerbForm | null>(null);

  const pendingCount = useMemo(
    () => FORMS.filter((f) => fields[f].status === "pending").length,
    [fields],
  );

  const allCorrect = useMemo(
    () => FORMS.every((f) => fields[f].status === "correct"),
    [fields],
  );

  // Focus first retry field after judging
  useEffect(() => {
    if (firstRetryRef.current) {
      const el = inputRefs.current[firstRetryRef.current];
      if (el) el.focus();
      firstRetryRef.current = null;
    }
  }, [judged]);

  const handleTypeChange = useCallback((filter: string) => {
    setTypeFilter(filter);
    const newCandidates = getFilteredVerbs(filter);
    const newVerb = pickRandom(newCandidates);
    setVerb(newVerb);
    setFields(createEmptyFields());
    setJudged(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  }, []);

  const handleChange = useCallback((form: VerbForm, value: string) => {
    setFields((prev) => ({
      ...prev,
      [form]: { ...prev[form], value },
    }));
  }, []);

  const handleJudge = useCallback(() => {
    setFields((prev) => {
      const next = { ...prev };
      let firstWrong: VerbForm | null = null;
      for (const form of FORMS) {
        if (prev[form].status === "correct") continue;
        const isCorrect =
          prev[form].value.trim() === verb.forms[form];
        next[form] = {
          ...prev[form],
          status: isCorrect ? "correct" : "incorrect",
        };
        if (!isCorrect && !firstWrong) {
          firstWrong = form;
        }
      }
      firstRetryRef.current = firstWrong;
      return next;
    });
    setJudged(true);
  }, [verb]);

  const handleRetry = useCallback(() => {
    setFields((prev) => {
      const next = { ...prev };
      let firstWrong: VerbForm | null = null;
      for (const form of FORMS) {
        if (prev[form].status === "incorrect") {
          next[form] = { value: "", status: "pending" };
          if (!firstWrong) firstWrong = form;
        }
      }
      firstRetryRef.current = firstWrong;
      return next;
    });
    setJudged(false);
  }, []);

  const handleNext = useCallback(() => {
    const correctThisRound = FORMS.filter(
      (f) => fields[f].status === "correct",
    ).length;
    setSessionCorrect((c) => c + correctThisRound);
    setSessionTotal((t) => t + FORMS.length);

    const next = pickRandom(candidates, verb.id);
    setVerb(next);
    setFields(createEmptyFields());
    setJudged(false);
    setTimeout(() => {
      const el = inputRefs.current["未然形"];
      if (el) el.focus();
    }, 50);
  }, [verb.id, fields, candidates]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, form: VerbForm) => {
      if (e.key === "Enter") {
        const idx = FORMS.indexOf(form);
        for (let i = idx + 1; i < FORMS.length; i++) {
          if (fields[FORMS[i]].status === "pending") {
            inputRefs.current[FORMS[i]]?.focus();
            return;
          }
        }
        if (pendingCount > 0 || !judged) {
          handleJudge();
        }
      }
    },
    [fields, pendingCount, judged, handleJudge],
  );

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

      {/* Session stats */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tracking-wider">
          {verb.type} {verb.row}
        </span>
        {sessionTotal > 0 && (
          <span className="text-xs text-text-secondary">
            {sessionCorrect}/{sessionTotal} 正解
          </span>
        )}
      </div>

      {/* Stem display */}
      <div className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm text-center">
        <div className="text-xs text-muted tracking-widest mb-1">語幹</div>
        <div className="text-3xl font-black text-sumi-dark tracking-wider">
          {verb.stem || "(なし)"}
        </div>
        <div className="text-sm text-text-secondary mt-1">
          {verb.representative}
        </div>
      </div>

      {/* Form input fields */}
      <div className="flex flex-col gap-1.5">
        {FORMS.map((form) => {
          const field = fields[form];
          const color = FORM_HEX_MAP[form];
          const formInfo = SIX_FORMS_OVERVIEW.find((f) => f.form === form);
          const isCorrect = field.status === "correct";
          const isIncorrect = field.status === "incorrect";
          const isPending = field.status === "pending";

          return (
            <div
              key={form}
              className={`border rounded-lg px-3 py-2 flex items-center gap-2 transition-all ${
                isCorrect
                  ? "bg-correct/10 border-correct"
                  : isIncorrect
                    ? "bg-incorrect/10 border-incorrect"
                    : "bg-card border-border"
              }`}
            >
              <span
                className="text-xs font-bold w-14 shrink-0"
                style={{ color }}
              >
                {form}
              </span>

              <span className="text-sm text-sumi-dark/50 shrink-0">
                {verb.stem}
              </span>

              {isCorrect ? (
                <span
                  className="text-sm font-bold flex-1"
                  style={{ color }}
                >
                  {verb.forms[form]}
                </span>
              ) : isIncorrect && judged ? (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm line-through text-incorrect">
                    {field.value || "(空)"}
                  </span>
                  <span className="text-sm font-bold" style={{ color }}>
                    → {verb.forms[form]}
                  </span>
                </div>
              ) : (
                <input
                  ref={(el) => {
                    inputRefs.current[form] = el;
                  }}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleChange(form, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, form)}
                  disabled={!isPending}
                  placeholder="..."
                  className="border border-border rounded px-2 py-1 text-sm bg-white focus:border-sumi-dark outline-none flex-1 min-w-0"
                  autoComplete="off"
                />
              )}

              {isCorrect && formInfo && (
                <span className="text-[10px] text-muted shrink-0 hidden min-[360px]:inline">
                  {formInfo.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        {!allCorrect && !judged && (
          <button
            type="button"
            onClick={handleJudge}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
          >
            判定
          </button>
        )}

        {judged && !allCorrect && (
          <button
            type="button"
            onClick={handleRetry}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
          >
            間違いを再入力
          </button>
        )}

        {allCorrect && (
          <div className="flex flex-col items-center gap-2 animate-slide-up">
            <span className="text-sm font-bold text-correct">
              全問正解!
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
            >
              次の動詞 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
