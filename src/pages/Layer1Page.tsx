import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar.tsx";
import { useProgress } from "../hooks/useProgress.ts";
import { VERB_TYPES, type VerbTypeEntry } from "../data/verb-types.ts";
import { FORM_HEX_MAP } from "../data/constants.ts";
import { CONJUGATION_GUIDES } from "../data/conjugation-guide.ts";
import type { VerbForm } from "../types/core.ts";

const FORMS: VerbForm[] = [
  "未然形",
  "連用形",
  "終止形",
  "連体形",
  "已然形",
  "命令形",
];

const DELAYS = [1800, 1500, 1200, 1000, 800, 600];

interface TypeGroup {
  label: string;
  types: { name: string; verb: VerbTypeEntry }[];
}

function getRepresentative(typeName: string): VerbTypeEntry {
  return VERB_TYPES.find((v) => v.type === typeName)!;
}

const GROUPS: TypeGroup[] = [
  {
    label: "多数派",
    types: [
      { name: "四段", verb: getRepresentative("四段活用") },
      { name: "上二段", verb: getRepresentative("上二段活用") },
      { name: "下二段", verb: getRepresentative("下二段活用") },
    ],
  },
  {
    label: "少数派",
    types: [
      { name: "上一段", verb: getRepresentative("上一段活用") },
      { name: "下一段", verb: getRepresentative("下一段活用") },
    ],
  },
  {
    label: "変格",
    types: [
      { name: "カ変", verb: getRepresentative("カ行変格活用") },
      { name: "サ変", verb: getRepresentative("サ行変格活用") },
      { name: "ナ変", verb: getRepresentative("ナ行変格活用") },
      { name: "ラ変", verb: getRepresentative("ラ行変格活用") },
    ],
  },
];

const ALL_TYPES = GROUPS.flatMap((g) => g.types);

type Mode = "guide" | "reading" | "mizen-only" | "blank";
const MODES: { key: Mode; label: string }[] = [
  { key: "guide", label: "解説" },
  { key: "reading", label: "音読" },
  { key: "mizen-only", label: "未然形だけ" },
  { key: "blank", label: "白紙" },
];

export function Layer1Page() {
  const { updateLayer } = useProgress();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("guide");
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [typeIdx, setTypeIdx] = useState(0);
  const [completedTypes, setCompletedTypes] = useState<Set<number>>(new Set());

  // --- Reading mode state ---
  const [visibleCount, setVisibleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Mizen-only mode state ---
  const [revealCount, setRevealCount] = useState(1); // starts with 未然形 visible

  // --- Blank mode state ---
  const [blankFields, setBlankFields] = useState<Record<VerbForm, string>>(() =>
    Object.fromEntries(FORMS.map((f) => [f, ""])) as Record<VerbForm, string>,
  );
  const [blankJudged, setBlankJudged] = useState(false);

  const currentType = ALL_TYPES[typeIdx];
  const verb = currentType.verb;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-expand for reading mode
  useEffect(() => {
    if (mode !== "reading" || !running || visibleCount >= FORMS.length) {
      if (mode === "reading" && running && visibleCount >= FORMS.length) {
        setRunning(false);
        setCompletedTypes((prev) => new Set(prev).add(typeIdx));
      }
      return;
    }
    const delay = DELAYS[visibleCount] ?? 600;
    timerRef.current = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, delay);
    return clearTimer;
  }, [mode, running, visibleCount, typeIdx, clearTimer]);

  const handleStart = useCallback(() => {
    clearTimer();
    setVisibleCount(0);
    setRunning(true);
  }, [clearTimer]);

  const handleTypeChange = useCallback(
    (idx: number) => {
      clearTimer();
      setTypeIdx(idx);
      setVisibleCount(0);
      setRunning(false);
      setRevealCount(1);
      setBlankFields(
        Object.fromEntries(FORMS.map((f) => [f, ""])) as Record<VerbForm, string>,
      );
      setBlankJudged(false);
    },
    [clearTimer],
  );

  const handleModeChange = useCallback(
    (m: Mode) => {
      clearTimer();
      setMode(m);
      setVisibleCount(0);
      setRunning(false);
      setRevealCount(1);
      setBlankFields(
        Object.fromEntries(FORMS.map((f) => [f, ""])) as Record<VerbForm, string>,
      );
      setBlankJudged(false);
    },
    [clearTimer],
  );

  const handleNext = useCallback(() => {
    const nextIdx = (typeIdx + 1) % ALL_TYPES.length;
    handleTypeChange(nextIdx);
    if (mode === "reading") {
      setTimeout(() => setRunning(true), 300);
    }
  }, [typeIdx, handleTypeChange, mode]);

  const handleReveal = useCallback(() => {
    if (revealCount < FORMS.length) {
      setRevealCount((c) => c + 1);
    }
    if (revealCount >= FORMS.length - 1) {
      setCompletedTypes((prev) => new Set(prev).add(typeIdx));
    }
  }, [revealCount, typeIdx]);

  const handleBlankJudge = useCallback(() => {
    setBlankJudged(true);
    const allCorrect = FORMS.every(
      (f) => blankFields[f].trim() === verb.forms[f],
    );
    if (allCorrect) {
      setCompletedTypes((prev) => new Set(prev).add(typeIdx));
    }
  }, [blankFields, verb, typeIdx]);

  const handleBlankChange = useCallback((form: VerbForm, value: string) => {
    setBlankFields((prev) => ({ ...prev, [form]: value }));
  }, []);

  const handleComplete = useCallback(async () => {
    await updateLayer(1, { mastery: 100, completed: true });
    navigate("/");
  }, [updateLayer, navigate]);

  const allDone = completedTypes.size >= ALL_TYPES.length;

  return (
    <>
      <TopBar title="古文活用" subtitle="ステップ 1 — 活用の種類" backTo="/" />

      {/* Mode tabs */}
      <div className="sticky top-14 z-40 bg-sumi-dark/95 backdrop-blur-sm px-4 py-2 flex gap-1 justify-center">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => handleModeChange(m.key)}
            className={`px-4 py-1.5 border rounded text-xs font-semibold transition-all ${
              mode === m.key
                ? "bg-muted text-washi border-muted"
                : "bg-transparent text-muted border-sumi-dark/50 hover:border-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <main className="px-4 py-3 flex flex-col gap-3">
        {/* === Guide mode === */}
        {mode === "guide" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted text-center">
              活用の種類は全部で9種。タップで解説を開く。
            </p>
            {(["多数派", "少数派", "変格"] as const).map((groupLabel) => (
              <div key={groupLabel} className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-sumi-dark tracking-wider">{groupLabel}</span>
                {CONJUGATION_GUIDES.filter((g) => g.group === groupLabel).map((guide) => {
                  const isOpen = expandedGuide === guide.name;
                  const guideVerb = getRepresentative(guide.name);
                  return (
                    <button
                      key={guide.name}
                      type="button"
                      onClick={() => setExpandedGuide(isOpen ? null : guide.name)}
                      className={`w-full text-left border rounded-lg px-3 py-2.5 transition-all ${
                        isOpen ? "bg-card border-sumi-dark shadow-sm" : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-sumi-dark">{guide.name}</span>
                        <span className="text-[10px] text-muted">{isOpen ? "▲" : "▼"}</span>
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">{guide.pattern}</div>

                      {isOpen && (
                        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                          <div>
                            <span className="text-[10px] text-muted">見分け方</span>
                            <p className="text-xs text-sumi-dark">{guide.howToIdentify}</p>
                          </div>

                          {/* Conjugation table */}
                          {guideVerb && (
                            <div>
                              <span className="text-[10px] text-muted">活用表（{guideVerb.representative}）</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {FORMS.map((form) => (
                                  <span
                                    key={form}
                                    className="border rounded px-2 py-0.5 text-xs"
                                    style={{
                                      borderColor: FORM_HEX_MAP[form] + "60",
                                      color: FORM_HEX_MAP[form],
                                      backgroundColor: FORM_HEX_MAP[form] + "10",
                                    }}
                                  >
                                    {guideVerb.stem}{guideVerb.forms[form]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] text-muted">覚えるべき語</span>
                            <div className="flex gap-1 flex-wrap mt-0.5">
                              {guide.keyVerbs.map((v) => (
                                <span key={v} className="bg-washi border border-border rounded px-2 py-0.5 text-xs text-sumi-dark">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </div>

                          {guide.notes && (
                            <p className="text-[11px] text-text-secondary">{guide.notes}</p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Type selector (for non-guide modes) */}
        {mode !== "guide" && (
          <>
            {GROUPS.map((group) => (
              <div key={group.label} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted w-10 shrink-0">{group.label}</span>
                <div className="flex gap-1 flex-wrap">
                  {group.types.map((t) => {
                    const idx = ALL_TYPES.indexOf(t);
                    const done = completedTypes.has(idx);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => handleTypeChange(idx)}
                        className={`px-2.5 py-1 border rounded text-xs transition-all ${
                          typeIdx === idx
                            ? "bg-sumi-dark text-washi border-sumi-dark"
                            : done
                              ? "bg-correct/15 text-correct border-correct/50"
                              : "bg-card text-text-secondary border-border hover:border-sumi-dark/50"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Verb header */}
            <div className="text-center">
              <span className="text-sm font-bold text-sumi-dark">{verb.type}</span>
              <span className="text-xs text-muted ml-2">
                {verb.representative}（{verb.row}）
              </span>
              {verb.mnemonic && (
                <div className="text-[10px] text-muted mt-0.5">{verb.mnemonic}</div>
              )}
            </div>
          </>
        )}

        {/* === Reading mode === */}
        {mode === "reading" && (
          <>
            <div className="flex flex-col gap-1.5">
              {FORMS.map((form, i) => {
                const color = FORM_HEX_MAP[form];
                const isVisible = i < visibleCount;
                return (
                  <div
                    key={form}
                    className="border-2 rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-500"
                    style={{
                      borderColor: isVisible ? color : "transparent",
                      backgroundColor: isVisible ? color + "10" : "transparent",
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(8px)",
                    }}
                  >
                    <span className="text-xs font-bold w-12 shrink-0" style={{ color }}>
                      {form}
                    </span>
                    <span className="text-xl font-bold text-sumi-dark">{verb.stem}</span>
                    <span className="text-2xl font-black" style={{ color }}>
                      {verb.forms[form]}
                    </span>
                  </div>
                );
              })}
            </div>

            {!running && visibleCount === 0 && (
              <button
                type="button"
                onClick={handleStart}
                className="bg-sumi-dark text-washi px-8 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
              >
                音読スタート
              </button>
            )}
            {running && (
              <p className="text-xs text-muted tracking-wider text-center">
                声に出して読んでください
              </p>
            )}
            {!running && visibleCount >= FORMS.length && (
              <div className="flex gap-2 w-full">
                <button type="button" onClick={handleStart} className="flex-1 text-text-secondary border border-border px-4 py-2.5 rounded-lg text-sm">
                  もう一度
                </button>
                <button type="button" onClick={handleNext} className="flex-1 bg-sumi-dark text-washi px-4 py-2.5 rounded-lg text-sm font-bold">
                  次の活用 →
                </button>
              </div>
            )}
          </>
        )}

        {/* === Mizen-only mode === */}
        {mode === "mizen-only" && (
          <>
            <div className="flex flex-col gap-1.5">
              {FORMS.map((form, i) => {
                const color = FORM_HEX_MAP[form];
                const isVisible = i < revealCount;
                return (
                  <div
                    key={form}
                    className="border-2 rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-300"
                    style={{
                      borderColor: isVisible ? color : "#e0d8cc",
                      backgroundColor: isVisible ? color + "10" : "transparent",
                    }}
                  >
                    <span className="text-xs font-bold w-12 shrink-0" style={{ color: isVisible ? color : "#999" }}>
                      {form}
                    </span>
                    {isVisible ? (
                      <>
                        <span className="text-xl font-bold text-sumi-dark">{verb.stem}</span>
                        <span className="text-2xl font-black" style={{ color }}>{verb.forms[form]}</span>
                      </>
                    ) : (
                      <span className="text-xl text-muted">？</span>
                    )}
                  </div>
                );
              })}
            </div>

            {revealCount < FORMS.length ? (
              <button
                type="button"
                onClick={handleReveal}
                className="bg-sumi-dark text-washi px-8 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
              >
                次を見る →
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => { handleTypeChange(typeIdx); setRevealCount(1); }}
                  className="flex-1 text-text-secondary border border-border px-4 py-2.5 rounded-lg text-sm"
                >
                  もう一度
                </button>
                <button type="button" onClick={handleNext} className="flex-1 bg-sumi-dark text-washi px-4 py-2.5 rounded-lg text-sm font-bold">
                  次の活用 →
                </button>
              </div>
            )}
          </>
        )}

        {/* === Blank mode === */}
        {mode === "blank" && (
          <>
            <div className="flex flex-col gap-1.5">
              {FORMS.map((form) => {
                const color = FORM_HEX_MAP[form];
                const answer = verb.forms[form];
                const userVal = blankFields[form].trim();
                const isCorrect = blankJudged && userVal === answer;
                const isWrong = blankJudged && userVal !== answer;

                return (
                  <div
                    key={form}
                    className={`border-2 rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all ${
                      isCorrect ? "border-correct bg-correct/10" : isWrong ? "border-incorrect bg-incorrect/10" : "border-border bg-card"
                    }`}
                  >
                    <span className="text-xs font-bold w-12 shrink-0" style={{ color }}>{form}</span>
                    <span className="text-sm text-sumi-dark/50 shrink-0">{verb.stem}</span>

                    {blankJudged ? (
                      <div className="flex items-center gap-2 flex-1">
                        {isCorrect ? (
                          <span className="text-lg font-black" style={{ color }}>{answer}</span>
                        ) : (
                          <>
                            <span className="text-sm line-through text-incorrect">{userVal || "(空)"}</span>
                            <span className="text-lg font-black" style={{ color }}>→ {answer}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={blankFields[form]}
                        onChange={(e) => handleBlankChange(form, e.target.value)}
                        placeholder="..."
                        className="border border-border rounded px-2 py-1.5 text-sm bg-white focus:border-sumi-dark outline-none flex-1 min-w-0"
                        autoComplete="off"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {!blankJudged ? (
              <button
                type="button"
                onClick={handleBlankJudge}
                className="bg-sumi-dark text-washi px-8 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
              >
                判定
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleTypeChange(typeIdx)}
                  className="flex-1 text-text-secondary border border-border px-4 py-2.5 rounded-lg text-sm"
                >
                  もう一度
                </button>
                <button type="button" onClick={handleNext} className="flex-1 bg-sumi-dark text-washi px-4 py-2.5 rounded-lg text-sm font-bold">
                  次の活用 →
                </button>
              </div>
            )}
          </>
        )}

        {/* Progress */}
        <div className="text-center text-xs text-muted">
          {completedTypes.size} / {ALL_TYPES.length} 種類 完了
        </div>

        {allDone && (
          <button
            type="button"
            onClick={handleComplete}
            className="bg-sumi-dark text-washi px-6 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
          >
            ステップ1 完了 →
          </button>
        )}
      </main>
    </>
  );
}
