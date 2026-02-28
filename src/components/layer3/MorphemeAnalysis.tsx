import { useState, useCallback, useMemo } from "react";
import { SENTENCES } from "../../data/sentences.ts";
import type { Difficulty, Morpheme, SentenceData } from "../../types/sentence.ts";

const DIFFICULTY_TABS: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
];

type Phase = "splitting" | "identification" | "result";

interface SplitCheckResult {
  correct: number[];
  missed: number[];
  extra: number[];
}

/** Derive correct split positions (character indices) from morphemes. */
function getCorrectSplitPositions(sentence: string, morphemes: Morpheme[]): number[] {
  const positions: number[] = [];
  let offset = 0;
  for (let i = 0; i < morphemes.length - 1; i++) {
    offset += morphemes[i].surface.length;
    // Only add if the boundary falls within the sentence
    if (offset < sentence.length) {
      positions.push(offset);
    }
  }
  return positions;
}

/** Compare user splits with correct positions. */
function checkSplits(userPositions: number[], correctPositions: number[]): SplitCheckResult {
  const correctSet = new Set(correctPositions);
  const userSet = new Set(userPositions);

  const correct = userPositions.filter((p) => correctSet.has(p));
  const extra = userPositions.filter((p) => !correctSet.has(p));
  const missed = correctPositions.filter((p) => !userSet.has(p));

  return { correct, missed, extra };
}

export function MorphemeAnalysis() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("splitting");
  const [splitPositions, setSplitPositions] = useState<Set<number>>(new Set());
  const [splitResult, setSplitResult] = useState<SplitCheckResult | null>(null);
  const [revealedIdx, setRevealedIdx] = useState<Set<number>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => SENTENCES.filter((s) => s.difficulty === difficulty),
    [difficulty],
  );

  const sentence: SentenceData | undefined = filtered[sentenceIdx];
  const chars = useMemo(() => (sentence ? [...sentence.text] : []), [sentence]);

  const correctPositions = useMemo(
    () => (sentence ? getCorrectSplitPositions(sentence.text, sentence.morphemes) : []),
    [sentence],
  );

  const handleDifficultyChange = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
      setSentenceIdx(0);
      setPhase("splitting");
      setSplitPositions(new Set());
      setSplitResult(null);
      setRevealedIdx(new Set());
    },
    [],
  );

  const handleToggleSplit = useCallback(
    (pos: number) => {
      if (phase !== "splitting" || splitResult !== null) return;
      setSplitPositions((prev) => {
        const next = new Set(prev);
        if (next.has(pos)) {
          next.delete(pos);
        } else {
          next.add(pos);
        }
        return next;
      });
    },
    [phase, splitResult],
  );

  const handleCheckSplits = useCallback(() => {
    const result = checkSplits([...splitPositions], correctPositions);
    setSplitResult(result);
  }, [splitPositions, correctPositions]);

  const handleGoToIdentification = useCallback(() => {
    setPhase("identification");
    setRevealedIdx(new Set());
  }, []);

  const handleRevealMorpheme = useCallback((idx: number) => {
    setRevealedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  const handleShowResult = useCallback(() => {
    setPhase("result");
    if (sentence) {
      setCompletedIds((prev) => new Set(prev).add(sentence.id));
    }
  }, [sentence]);

  const handleNext = useCallback(() => {
    const nextIdx = sentenceIdx + 1;
    if (nextIdx < filtered.length) {
      setSentenceIdx(nextIdx);
    } else {
      setSentenceIdx(0);
    }
    setPhase("splitting");
    setSplitPositions(new Set());
    setSplitResult(null);
    setRevealedIdx(new Set());
  }, [sentenceIdx, filtered.length]);

  if (!sentence) {
    return (
      <div className="text-center text-xs text-muted py-8">
        この難易度の例文はありません
      </div>
    );
  }

  const completedCount = filtered.filter((s) => completedIds.has(s.id)).length;

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Difficulty tabs */}
      <div className="flex gap-1.5 justify-center">
        {DIFFICULTY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleDifficultyChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              difficulty === tab.key
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-muted">
          {sentenceIdx + 1} / {filtered.length}
        </span>
        <span className="text-[10px] text-correct">
          {completedCount > 0 && `${completedCount}文完了`}
        </span>
      </div>

      {/* Sentence display card */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
        <div className="text-lg font-bold text-sumi-dark tracking-wide leading-relaxed text-center mb-1">
          {sentence.text}
        </div>
        <div className="text-[10px] text-muted text-center tracking-wider">
          {sentence.source}
        </div>
        {sentence.features.length > 0 && (
          <div className="flex gap-1 justify-center mt-1.5">
            {sentence.features.map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 bg-shu/10 text-shu border border-shu/30 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Phase: Splitting */}
      {phase === "splitting" && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-3 animate-slide-up">
          <div className="text-xs font-bold text-text-secondary tracking-wider border-b border-border pb-1.5">
            文字の間をタップして語の区切りを入れよう
          </div>

          {/* Interactive character row */}
          <div className="flex flex-wrap justify-center items-center py-2">
            {chars.map((char, i) => {
              // Determine boundary styling after this character
              const pos = i + 1; // boundary after char at index i
              const isUserSplit = splitPositions.has(pos);
              const isLastChar = i === chars.length - 1;

              // After check: color the boundaries
              let boundaryClass = "";
              if (splitResult && !isLastChar) {
                if (splitResult.correct.includes(pos)) {
                  boundaryClass = "bg-correct";
                } else if (splitResult.extra.includes(pos)) {
                  boundaryClass = "bg-incorrect";
                } else if (splitResult.missed.includes(pos)) {
                  boundaryClass = "bg-form-izen";
                }
              }

              return (
                <span key={i} className="flex items-center">
                  <span className="text-xl font-bold text-sumi-dark select-none px-0.5">
                    {char}
                  </span>
                  {!isLastChar && (
                    <button
                      type="button"
                      onClick={() => handleToggleSplit(pos)}
                      className={`w-5 h-8 flex items-center justify-center mx-0 transition-all ${
                        splitResult ? "cursor-default" : "cursor-pointer active:scale-110"
                      }`}
                      disabled={splitResult !== null}
                      aria-label={`区切り位置 ${pos}`}
                    >
                      {isUserSplit || (splitResult && splitResult.missed.includes(pos)) ? (
                        <span
                          className={`w-0.5 h-6 rounded-full ${
                            boundaryClass || "bg-sumi-dark"
                          }`}
                        />
                      ) : (
                        <span className="w-0.5 h-3 rounded-full bg-border/40" />
                      )}
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          {/* Split result feedback */}
          {splitResult && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <div className="flex gap-3 justify-center text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-correct" />
                  正解 {splitResult.correct.length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-incorrect" />
                  余分 {splitResult.extra.length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-form-izen" />
                  不足 {splitResult.missed.length}
                </span>
              </div>
              {splitResult.missed.length === 0 && splitResult.extra.length === 0 ? (
                <div className="text-center text-xs text-correct font-bold">
                  全区切り正解
                </div>
              ) : (
                <div className="text-center text-xs text-muted">
                  正解の区切り: {sentence.morphemes.map((m) => m.surface).join(" | ")}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-center">
            {!splitResult ? (
              <button
                type="button"
                onClick={handleCheckSplits}
                disabled={splitPositions.size === 0}
                className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide transition-opacity disabled:opacity-30"
              >
                分解を確認
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoToIdentification}
                className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide"
              >
                品詞を確認する
              </button>
            )}
          </div>
        </div>
      )}

      {/* Phase: Identification */}
      {phase === "identification" && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 animate-slide-up">
          <div className="text-xs font-bold text-text-secondary tracking-wider border-b border-border pb-1.5">
            各語をタップして品詞情報を確認
          </div>

          <div className="flex flex-col gap-1.5">
            {sentence.morphemes.map((m, i) => {
              const isRevealed = revealedIdx.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRevealMorpheme(i)}
                  className={`w-full text-left border rounded-lg px-3 py-2 transition-all ${
                    isRevealed
                      ? "bg-correct/5 border-correct/40"
                      : "bg-washi border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-sumi-dark">{m.surface}</span>
                    {!isRevealed && (
                      <span className="text-[10px] text-muted">タップで表示</span>
                    )}
                  </div>
                  {isRevealed && (
                    <div className="flex flex-col gap-0.5 mt-1 animate-fade-in">
                      <div className="text-[11px] text-text-secondary">
                        <span className="font-bold">品詞:</span> {m.pos}
                      </div>
                      {m.meaning && (
                        <div className="text-[11px] text-text-secondary">
                          <span className="font-bold">意味:</span> {m.meaning}
                        </div>
                      )}
                      {m.note && (
                        <div className="text-[10px] text-muted leading-snug mt-0.5">
                          {m.note}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleShowResult}
            className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide self-center mt-1"
          >
            一覧表を見る
          </button>
        </div>
      )}

      {/* Phase: Result */}
      {phase === "result" && (
        <div className="bg-card border border-border rounded-xl px-3 py-3 shadow-sm flex flex-col gap-2 animate-slide-up">
          <div className="text-xs font-bold text-text-secondary tracking-wider border-b border-border pb-1.5">
            品詞分解一覧
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 px-1.5 font-bold text-muted">語</th>
                  <th className="text-left py-1 px-1.5 font-bold text-muted">品詞</th>
                  <th className="text-left py-1 px-1.5 font-bold text-muted">意味</th>
                </tr>
              </thead>
              <tbody>
                {sentence.morphemes.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-1.5 font-bold text-sumi-dark whitespace-nowrap">
                      {m.surface}
                    </td>
                    <td className="py-1.5 px-1.5 text-text-secondary">
                      {m.pos}
                    </td>
                    <td className="py-1.5 px-1.5 text-text-secondary">
                      {m.meaning || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes section */}
          {sentence.morphemes.some((m) => m.note) && (
            <div className="bg-washi border border-border rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted tracking-wider mb-1">注釈</div>
              {sentence.morphemes
                .filter((m) => m.note)
                .map((m, i) => (
                  <div key={i} className="text-[10px] text-text-secondary leading-snug mb-0.5">
                    <span className="font-bold">{m.surface}:</span> {m.note}
                  </div>
                ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide self-center"
          >
            次の文
          </button>
        </div>
      )}
    </div>
  );
}
