import { useState, useCallback, useMemo } from "react";
import { AUXILIARIES } from "../../data/auxiliaries.ts";
import type {
  AuxiliaryVerbData,
  DisambiguationStep,
  DisambiguationOption,
} from "../../types/auxiliary.ts";

// ─── Inline disambiguation flows for る/らる ───

const RU_RARU_FLOW: DisambiguationStep[] = [
  {
    step: 1,
    question: "動作主が主語か？（主語が動作を受けているか）",
    options: [
      { choice: "動作を受けている", result: "受身" },
      { choice: "動作を受けていない", next: 2 },
    ],
  },
  {
    step: 2,
    question: "主語の身分・状況は？",
    options: [
      { choice: "高貴な人物が主語", result: "尊敬" },
      { choice: "自然にそう感じる（心情）", result: "自発" },
      { choice: "それ以外", result: "可能" },
    ],
  },
];

// ─── Example sentences for each auxiliary ───

interface FlowExercise {
  auxiliary: AuxiliaryVerbData;
  flow: DisambiguationStep[];
  sentence: string;
  highlight: string;
  correctPath: { step: number; choice: string }[];
  correctResult: string;
}

function buildExercises(): FlowExercise[] {
  const exercises: FlowExercise[] = [];

  // む (has disambiguationFlow in data)
  const mu = AUXILIARIES.find((a) => a.id === "mu");
  if (mu?.disambiguationFlow) {
    exercises.push({
      auxiliary: mu,
      flow: mu.disambiguationFlow,
      sentence: "われ都へ帰らむ。",
      highlight: "む",
      correctPath: [{ step: 1, choice: "一人称" }],
      correctResult: "意志",
    });
    exercises.push({
      auxiliary: mu,
      flow: mu.disambiguationFlow,
      sentence: "この歌詠まむ人はまゐれ。",
      highlight: "む",
      correctPath: [{ step: 1, choice: "二人称" }],
      correctResult: "勧誘・適当",
    });
    exercises.push({
      auxiliary: mu,
      flow: mu.disambiguationFlow,
      sentence: "雨降らむ日は出でじ。",
      highlight: "む",
      correctPath: [
        { step: 1, choice: "三人称" },
        { step: 2, choice: "連体形（名詞修飾）" },
      ],
      correctResult: "婉曲・仮定",
    });
    exercises.push({
      auxiliary: mu,
      flow: mu.disambiguationFlow,
      sentence: "秋は来ぬらむ。",
      highlight: "む",
      correctPath: [
        { step: 1, choice: "三人称" },
        { step: 2, choice: "文末" },
      ],
      correctResult: "推量",
    });
  }

  // なり（推定） (has disambiguationFlow in data)
  const nariSuitei = AUXILIARIES.find((a) => a.id === "nari-suitei");
  if (nariSuitei?.disambiguationFlow) {
    exercises.push({
      auxiliary: nariSuitei,
      flow: nariSuitei.disambiguationFlow,
      sentence: "笛吹くなり。",
      highlight: "なり",
      correctPath: [{ step: 1, choice: "終止形" }],
      correctResult: "推定の「なり」",
    });
    exercises.push({
      auxiliary: nariSuitei,
      flow: nariSuitei.disambiguationFlow,
      sentence: "男なり。",
      highlight: "なり",
      correctPath: [{ step: 1, choice: "連体形・体言" }],
      correctResult: "断定の「なり」",
    });
  }

  // る/らる (inline flow)
  const ru = AUXILIARIES.find((a) => a.id === "ru");
  const raru = AUXILIARIES.find((a) => a.id === "raru");

  if (ru) {
    exercises.push({
      auxiliary: ru,
      flow: RU_RARU_FLOW,
      sentence: "大臣に召さる。",
      highlight: "る",
      correctPath: [{ step: 1, choice: "動作を受けている" }],
      correctResult: "受身",
    });
    exercises.push({
      auxiliary: ru,
      flow: RU_RARU_FLOW,
      sentence: "帝、御覧ぜらる。",
      highlight: "る",
      correctPath: [
        { step: 1, choice: "動作を受けていない" },
        { step: 2, choice: "高貴な人物が主語" },
      ],
      correctResult: "尊敬",
    });
    exercises.push({
      auxiliary: ru,
      flow: RU_RARU_FLOW,
      sentence: "秋の夕暮れ思ひ出でらる。",
      highlight: "る",
      correctPath: [
        { step: 1, choice: "動作を受けていない" },
        { step: 2, choice: "自然にそう感じる（心情）" },
      ],
      correctResult: "自発",
    });
  }

  if (raru) {
    exercises.push({
      auxiliary: raru,
      flow: RU_RARU_FLOW,
      sentence: "このことえ忍ばれず。",
      highlight: "れ",
      correctPath: [
        { step: 1, choice: "動作を受けていない" },
        { step: 2, choice: "それ以外" },
      ],
      correctResult: "可能",
    });
  }

  return exercises;
}

/** Render sentence with first occurrence of highlight marked. */
function renderHighlight(sentence: string, highlight: string) {
  const idx = sentence.indexOf(highlight);
  if (idx === -1) return <span>{sentence}</span>;
  return (
    <>
      <span>{sentence.slice(0, idx)}</span>
      <span className="font-black text-shu underline decoration-2 underline-offset-2">
        {highlight}
      </span>
      <span>{sentence.slice(idx + highlight.length)}</span>
    </>
  );
}

type FlowState = "select" | "stepping" | "result";

export function NarrowingFlow() {
  const exercises = useMemo(() => buildExercises(), []);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>("select");
  const [currentStepNum, setCurrentStepNum] = useState(1);
  const [userChoices, setUserChoices] = useState<
    { step: number; choice: string }[]
  >([]);
  const [userResult, setUserResult] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const exercise = exercises[exerciseIdx] as FlowExercise | undefined;

  const currentStep = useMemo(() => {
    if (!exercise) return null;
    return exercise.flow.find((s) => s.step === currentStepNum) ?? null;
  }, [exercise, currentStepNum]);

  const startExercise = useCallback((idx: number) => {
    setExerciseIdx(idx);
    setFlowState("stepping");
    setCurrentStepNum(1);
    setUserChoices([]);
    setUserResult(null);
  }, []);

  const handleChoice = useCallback(
    (option: DisambiguationOption) => {
      const newChoices = [
        ...userChoices,
        { step: currentStepNum, choice: option.choice },
      ];
      setUserChoices(newChoices);

      if (option.result) {
        // Final result
        setUserResult(option.result);
        setFlowState("result");
        if (exercise) {
          const isCorrect = option.result === exercise.correctResult;
          setStats((s) => ({
            correct: s.correct + (isCorrect ? 1 : 0),
            total: s.total + 1,
          }));
        }
      } else if (option.next !== undefined) {
        setCurrentStepNum(option.next);
      }
    },
    [userChoices, currentStepNum, exercise],
  );

  const nextExercise = useCallback(() => {
    const nextIdx = (exerciseIdx + 1) % exercises.length;
    startExercise(nextIdx);
  }, [exerciseIdx, exercises.length, startExercise]);

  const isCorrect =
    exercise && userResult ? userResult === exercise.correctResult : false;

  return (
    <div className="flex flex-col gap-2">
      {/* Stats */}
      {stats.total > 0 && (
        <div className="flex justify-between items-center text-xs text-text-secondary bg-washi border border-border rounded-lg px-3 py-1.5">
          <span>
            正答率{" "}
            <span className="font-bold text-sumi-dark">
              {stats.correct}/{stats.total}
            </span>
          </span>
          <span>
            {stats.total > 0
              ? Math.round((stats.correct / stats.total) * 100)
              : 0}
            %
          </span>
        </div>
      )}

      {/* Select exercise */}
      {flowState === "select" && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted text-center tracking-wider">
            多義語の意味を手順で絞り込む
          </div>
          {exercises.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => startExercise(i)}
              className="bg-card border border-border rounded-lg px-3 py-2.5 text-left hover:bg-washi transition-all flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-sumi-dark">
                  {ex.auxiliary.word}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {ex.sentence}
                </span>
              </div>
              <span className="text-xs text-muted shrink-0 ml-2">
                {ex.auxiliary.meanings.join("/")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stepping through flow */}
      {flowState === "stepping" && exercise && currentStep && (
        <div className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm flex flex-col gap-3 animate-slide-up">
          {/* Context sentence */}
          <div className="bg-washi border border-border rounded-lg px-3 py-2 text-center">
            <span className="text-sm text-sumi-dark leading-relaxed">
              {renderHighlight(exercise.sentence, exercise.highlight)}
            </span>
          </div>

          {/* Auxiliary label */}
          <div className="text-center">
            <span className="text-xs text-muted">
              {exercise.auxiliary.word} ({exercise.auxiliary.meanings.join("・")})
            </span>
          </div>

          {/* Previous choices */}
          {userChoices.length > 0 && (
            <div className="flex flex-col gap-1">
              {userChoices.map((c, i) => (
                <div
                  key={i}
                  className="text-[11px] text-text-secondary px-2 py-1 bg-washi/70 rounded"
                >
                  Step {c.step}: {c.choice}
                </div>
              ))}
            </div>
          )}

          {/* Current question */}
          <div className="text-sm font-bold text-sumi-dark text-center">
            Step {currentStep.step}: {currentStep.question}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-1.5">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChoice(opt)}
                className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-sumi-dark text-left hover:bg-washi transition-all active:scale-[0.98]"
              >
                {opt.choice}
                {opt.result && (
                  <span className="text-muted ml-1 text-xs">
                    → {opt.result}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {flowState === "result" && exercise && (
        <div
          className={`bg-card border rounded-xl px-4 py-4 shadow-sm flex flex-col gap-3 animate-fade-in ${
            isCorrect
              ? "border-correct bg-correct/5"
              : "border-incorrect bg-incorrect/5"
          }`}
        >
          {/* Context sentence */}
          <div className="bg-washi border border-border rounded-lg px-3 py-2 text-center">
            <span className="text-sm text-sumi-dark">
              {exercise.sentence.split(exercise.highlight).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="font-black text-shu underline decoration-2 underline-offset-2">
                      {exercise.highlight}
                    </span>
                  )}
                </span>
              ))}
            </span>
          </div>

          {/* User result */}
          <div className="text-center">
            <span
              className={`text-base font-black ${isCorrect ? "text-correct" : "text-incorrect"}`}
            >
              {isCorrect ? "正解" : "不正解"}
            </span>
            <div className="text-sm text-sumi-dark mt-1">
              あなたの答え:{" "}
              <span className="font-bold">{userResult}</span>
            </div>
            {!isCorrect && (
              <div className="text-sm text-correct mt-0.5">
                正解: <span className="font-bold">{exercise.correctResult}</span>
              </div>
            )}
          </div>

          {/* Correct path - always shown */}
          <div className="bg-washi border border-border rounded-lg px-3 py-2">
            <div className="text-[10px] text-muted tracking-wider mb-1">
              正解の手順
            </div>
            {exercise.correctPath.map((p, i) => {
              const step = exercise.flow.find((s) => s.step === p.step);
              return (
                <div key={i} className="text-[11px] text-text-secondary py-0.5">
                  Step {p.step}: {step?.question}
                  <span className="font-bold text-sumi-dark ml-1">
                    → {p.choice}
                  </span>
                </div>
              );
            })}
            <div className="text-xs font-bold text-sumi-dark mt-1 pt-1 border-t border-border">
              → {exercise.correctResult}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFlowState("select")}
              className="flex-1 text-text-secondary border border-border px-3 py-2 rounded-md text-sm"
            >
              一覧
            </button>
            <button
              type="button"
              onClick={nextExercise}
              className="flex-1 bg-sumi-dark text-washi px-3 py-2 rounded-md text-sm"
            >
              次の問題
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
