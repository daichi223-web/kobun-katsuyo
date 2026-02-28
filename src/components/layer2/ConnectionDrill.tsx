import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AUXILIARIES } from "../../data/auxiliaries.ts";
import type { AuxiliaryGroup, AuxiliaryVerbData } from "../../types/auxiliary.ts";
import type { VerbForm } from "../../types/core.ts";

const SIX_FORMS: VerbForm[] = [
  "未然形",
  "連用形",
  "終止形",
  "連体形",
  "已然形",
  "命令形",
];

const GROUP_FILTERS: { key: AuxiliaryGroup | "all"; label: string }[] = [
  { key: "all", label: "全て" },
  { key: "A", label: "A" },
  { key: "B", label: "B" },
  { key: "C", label: "C" },
  { key: "D", label: "D" },
];

const COUNTDOWN_MS = 5000;

// Connections that are simple VerbForm matches
const SIMPLE_CONNECTIONS: Set<string> = new Set(SIX_FORMS);

function isSimpleConnection(conn: string): conn is VerbForm {
  return SIMPLE_CONNECTIONS.has(conn);
}

type DrillState = "idle" | "active" | "feedback" | "finished";
type FeedbackKind = "correct" | "incorrect";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ConnectionDrill() {
  const [groupFilter, setGroupFilter] = useState<AuxiliaryGroup | "all">("all");
  const [state, setState] = useState<DrillState>("idle");
  const [queue, setQueue] = useState<AuxiliaryVerbData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [stats, setStats] = useState({ correct: 0, total: 0, totalTimeMs: 0 });
  const [countdown, setCountdown] = useState(COUNTDOWN_MS);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTimeoutRef = useRef<() => void>(() => {});
  const advanceQuestionRef = useRef<() => void>(() => {});

  const filtered = useMemo(
    () =>
      groupFilter === "all"
        ? AUXILIARIES
        : AUXILIARIES.filter((a) => a.group === groupFilter),
    [groupFilter],
  );

  const current = queue[currentIdx] as AuxiliaryVerbData | undefined;

  // Countdown timer
  useEffect(() => {
    if (state !== "active") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    questionStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - questionStartRef.current;
      const remaining = Math.max(0, COUNTDOWN_MS - elapsed);
      setCountdown(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeoutRef.current();
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, currentIdx]);

  const startDrill = useCallback(() => {
    const shuffled = shuffle(filtered);
    setQueue(shuffled);
    setCurrentIdx(0);
    setCountdown(COUNTDOWN_MS);
    setStats({ correct: 0, total: 0, totalTimeMs: 0 });
    setFeedback(null);
    setShowCustomInput(false);
    setCustomText("");
    setState("active");
  }, [filtered]);

  const advanceQuestion = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedback(null);
    setCountdown(COUNTDOWN_MS);
    setShowCustomInput(false);
    setCustomText("");
    setCurrentIdx((prev) => {
      const next = prev + 1;
      if (next >= queue.length) {
        setState("finished");
        return prev;
      }
      setState("active");
      return next;
    });
  }, [queue.length]);

  // Keep refs in sync with latest closures
  useEffect(() => {
    advanceQuestionRef.current = advanceQuestion;
  });
  useEffect(() => {
    handleTimeoutRef.current = () => {
      if (!current) return;
      setFeedback("incorrect");
      setCorrectAnswer(String(current.connection));
      setState("feedback");
      setStats((s) => ({
        ...s,
        total: s.total + 1,
        totalTimeMs: s.totalTimeMs + COUNTDOWN_MS,
      }));
      feedbackTimeoutRef.current = setTimeout(() => advanceQuestionRef.current(), 2000);
    };
  });

  const handleAnswer = useCallback(
    (answer: string) => {
      if (state !== "active" || !current) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const elapsed = Date.now() - questionStartRef.current;
      const conn = String(current.connection);
      const isCorrect =
        answer === conn ||
        conn.includes(answer) ||
        answer.replace(/\s/g, "") === conn.replace(/\s/g, "");

      setFeedback(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) setCorrectAnswer(conn);
      setStats((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
        totalTimeMs: s.totalTimeMs + elapsed,
      }));
      setState("feedback");

      feedbackTimeoutRef.current = setTimeout(
        () => advanceQuestionRef.current(),
        isCorrect ? 600 : 2000,
      );
    },
    [state, current],
  );

  const handleCustomSubmit = useCallback(() => {
    if (customText.trim()) {
      handleAnswer(customText.trim());
    }
  }, [customText, handleAnswer]);

  const avgTime = useMemo(() => {
    if (stats.total === 0) return "---";
    const avg = stats.totalTimeMs / stats.total / 1000;
    return `${avg.toFixed(1)}s`;
  }, [stats]);

  // Is this a simple 6-form connection?
  const needsCustom = current ? !isSimpleConnection(String(current.connection)) : false;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Group filter */}
      <div className="flex gap-1">
        {GROUP_FILTERS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => {
              setGroupFilter(g.key);
              setState("idle");
            }}
            className={`flex-1 px-2 py-1.5 border rounded text-xs transition-all ${
              groupFilter === g.key
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {stats.total > 0 && (
        <div className="flex justify-between items-center text-xs text-text-secondary bg-washi border border-border rounded-lg px-3 py-1.5">
          <span>
            正答率{" "}
            <span className="font-bold text-sumi-dark">
              {stats.correct}/{stats.total}
            </span>
          </span>
          <span>
            平均{" "}
            <span className="font-bold text-sumi-dark">{avgTime}</span>
          </span>
        </div>
      )}

      {/* Main area */}
      {state === "idle" && (
        <div className="bg-card border border-border rounded-xl px-4 py-6 shadow-sm text-center flex flex-col gap-3 items-center">
          <p className="text-xs text-text-secondary">
            助動詞が表示されたら、接続する活用形を即答
          </p>
          <p className="text-[10px] text-muted">
            {filtered.length}問 / 制限時間 各5秒
          </p>
          <button
            type="button"
            onClick={startDrill}
            className="bg-sumi-dark text-washi px-6 py-2 rounded-md text-sm"
          >
            開始
          </button>
        </div>
      )}

      {(state === "active" || state === "feedback") && current && (
        <div
          className={`bg-card border rounded-xl px-4 py-4 shadow-sm flex flex-col gap-3 items-center transition-all ${
            feedback === "correct"
              ? "border-correct bg-correct/5"
              : feedback === "incorrect"
                ? "border-incorrect bg-incorrect/5"
                : "border-border"
          }`}
        >
          {/* Auxiliary name */}
          <div className="text-3xl font-black text-sumi-dark tracking-wider">
            {current.word}
          </div>

          {/* Question */}
          <p className="text-xs text-text-secondary text-center">
            が付いているとき、直前の活用形は？
          </p>

          {/* Countdown bar */}
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                countdown < 1500 ? "bg-incorrect" : "bg-kin"
              }`}
              style={{
                width: `${(countdown / COUNTDOWN_MS) * 100}%`,
                transition: "width 50ms linear",
              }}
            />
          </div>

          {/* Answer buttons */}
          {state === "active" && (
            <>
              <div className="grid grid-cols-3 gap-1.5 w-full">
                {SIX_FORMS.map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => handleAnswer(form)}
                    className="bg-card border border-border rounded-lg px-2 py-2.5 text-sm font-semibold text-sumi-dark hover:bg-washi transition-all active:scale-95"
                  >
                    {form}
                  </button>
                ))}
              </div>

              {/* Custom / complex connection option */}
              {needsCustom && !showCustomInput && (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs text-muted border border-border rounded-md px-3 py-1.5"
                >
                  複合接続で回答
                </button>
              )}

              {showCustomInput && (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomSubmit();
                    }}
                    className="flex-1 border border-border rounded px-2 py-1.5 text-sm bg-white focus:border-sumi-dark outline-none"
                    placeholder="例: サ変未然形・四段已然形"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="bg-sumi-dark text-washi px-3 py-1.5 rounded text-sm shrink-0"
                  >
                    決定
                  </button>
                </div>
              )}
            </>
          )}

          {/* Feedback */}
          {state === "feedback" && feedback === "correct" && (
            <div className="text-sm font-bold text-correct animate-fade-in">
              正解
            </div>
          )}

          {state === "feedback" && feedback === "incorrect" && (
            <div className="flex flex-col items-center gap-1 animate-fade-in">
              <span className="text-sm font-bold text-incorrect">不正解</span>
              <span className="text-xs text-text-secondary">
                正解: <span className="font-bold">{correctAnswer}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {state === "finished" && (
        <div className="bg-card border border-border rounded-xl px-4 py-5 shadow-sm text-center flex flex-col gap-3 items-center animate-fade-in">
          <div className="text-xs text-muted tracking-widest">結果</div>
          <div className="text-2xl font-black text-sumi-dark">
            {stats.correct}/{stats.total}
          </div>
          <div className="text-xs text-text-secondary">
            正答率{" "}
            {stats.total > 0
              ? Math.round((stats.correct / stats.total) * 100)
              : 0}
            % / 平均 {avgTime}
          </div>
          <button
            type="button"
            onClick={startDrill}
            className="bg-sumi-dark text-washi px-6 py-2 rounded-md text-sm"
          >
            もう一度
          </button>
        </div>
      )}
    </div>
  );
}
