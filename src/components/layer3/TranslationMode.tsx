import { useState, useCallback, useMemo } from "react";
import { SENTENCES } from "../../data/sentences.ts";
import type { Difficulty, SentenceData } from "../../types/sentence.ts";

const DIFFICULTY_TABS: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
];

type Grade = "double-circle" | "circle" | "triangle" | "cross";

interface GradeInfo {
  symbol: string;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const GRADE_MAP: Record<Grade, GradeInfo> = {
  "double-circle": {
    symbol: "\u25CE",
    label: "優秀",
    colorClass: "text-correct",
    bgClass: "bg-correct/10",
    borderClass: "border-correct",
  },
  circle: {
    symbol: "\u25CB",
    label: "良好",
    colorClass: "text-form-renyou",
    bgClass: "bg-form-renyou/10",
    borderClass: "border-form-renyou",
  },
  triangle: {
    symbol: "\u25B3",
    label: "惜しい",
    colorClass: "text-form-izen",
    bgClass: "bg-form-izen/10",
    borderClass: "border-form-izen",
  },
  cross: {
    symbol: "\u00D7",
    label: "要復習",
    colorClass: "text-incorrect",
    bgClass: "bg-incorrect/10",
    borderClass: "border-incorrect",
  },
};

type ErrorType = "knowledge" | "shortcut" | "careless";

interface ErrorChoice {
  key: ErrorType;
  label: string;
  desc: string;
}

const ERROR_CHOICES: ErrorChoice[] = [
  { key: "knowledge", label: "知識不足", desc: "文法・語彙を知らなかった" },
  { key: "shortcut", label: "手順省略", desc: "品詞分解をせず訳した" },
  { key: "careless", label: "凡ミス", desc: "わかっていたのに間違えた" },
];

/** Extract keywords from a translation (split by common delimiters). */
function extractKeywords(text: string): string[] {
  const cleaned = text
    .replace(/[。、！？（）「」『』\s,.!?()[\]{}]/g, " ")
    .trim();
  // Filter out single-char tokens (particles, common kanji) to avoid false positives
  return cleaned
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

/** Calculate match ratio between user input and reference translations. */
function gradeTranslation(
  userText: string,
  references: string[],
): { grade: Grade; matchRatio: number; missingKeywords: string[] } {
  if (userText.trim().length === 0) {
    return { grade: "cross", matchRatio: 0, missingKeywords: [] };
  }

  const userKeywords = new Set(extractKeywords(userText));

  let bestRatio = 0;
  let bestMissing: string[] = [];

  for (const ref of references) {
    const refKeywords = extractKeywords(ref);
    if (refKeywords.length === 0) continue;

    let matched = 0;
    const missing: string[] = [];
    for (const kw of refKeywords) {
      // For short keywords (2 chars), only check tokenized match
      // For longer keywords (3+ chars), also check substring match
      const matchesToken = userKeywords.has(kw);
      const matchesSubstring = kw.length >= 3 && userText.includes(kw);
      if (matchesToken || matchesSubstring) {
        matched++;
      } else {
        missing.push(kw);
      }
    }
    const ratio = matched / refKeywords.length;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestMissing = missing;
    }
  }

  let grade: Grade;
  if (bestRatio >= 0.9) {
    grade = "double-circle";
  } else if (bestRatio >= 0.7) {
    grade = "circle";
  } else if (bestRatio >= 0.5) {
    grade = "triangle";
  } else {
    grade = "cross";
  }

  return { grade, matchRatio: bestRatio, missingKeywords: bestMissing };
}

export function TranslationMode() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [userText, setUserText] = useState("");
  const [gradeResult, setGradeResult] = useState<{
    grade: Grade;
    matchRatio: number;
    missingKeywords: string[];
  } | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [showMorphemes, setShowMorphemes] = useState(false);
  const [scores, setScores] = useState<Map<string, Grade>>(new Map());

  const filtered = useMemo(
    () => SENTENCES.filter((s) => s.difficulty === difficulty),
    [difficulty],
  );

  const sentence: SentenceData | undefined = filtered[sentenceIdx];

  const handleDifficultyChange = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
      setSentenceIdx(0);
      setUserText("");
      setGradeResult(null);
      setErrorType(null);
      setShowMorphemes(false);
    },
    [],
  );

  const handleGrade = useCallback(() => {
    if (!sentence) return;
    const result = gradeTranslation(userText, sentence.translations);
    setGradeResult(result);
    setScores((prev) => {
      const next = new Map(prev);
      next.set(sentence.id, result.grade);
      return next;
    });
  }, [sentence, userText]);

  const handleNext = useCallback(() => {
    const nextIdx = sentenceIdx + 1;
    if (nextIdx < filtered.length) {
      setSentenceIdx(nextIdx);
    } else {
      setSentenceIdx(0);
    }
    setUserText("");
    setGradeResult(null);
    setErrorType(null);
    setShowMorphemes(false);
  }, [sentenceIdx, filtered.length]);

  if (!sentence) {
    return (
      <div className="text-center text-xs text-muted py-8">
        この難易度の例文はありません
      </div>
    );
  }

  const gradeInfo = gradeResult ? GRADE_MAP[gradeResult.grade] : null;
  const scoredCount = filtered.filter((s) => scores.has(s.id)).length;

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
          {scoredCount > 0 && `${scoredCount}文採点済`}
        </span>
      </div>

      {/* Sentence card */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
        <div className="text-lg font-bold text-sumi-dark tracking-wide leading-relaxed text-center mb-1">
          {sentence.text}
        </div>
        <div className="text-[10px] text-muted text-center tracking-wider">
          {sentence.source}
        </div>

        {/* Collapsible morpheme reference */}
        <button
          type="button"
          onClick={() => setShowMorphemes((v) => !v)}
          className="text-[10px] text-text-secondary border border-border px-2 py-0.5 rounded-md mt-2 mx-auto block"
        >
          {showMorphemes ? "品詞分解を閉じる" : "品詞分解を見る"}
        </button>
        {showMorphemes && (
          <div className="mt-2 bg-washi border border-border rounded-lg px-2 py-1.5 animate-fade-in">
            <div className="flex flex-wrap gap-1">
              {sentence.morphemes.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 bg-card border border-border/60 rounded"
                >
                  <span className="font-bold">{m.surface}</span>
                  <span className="text-muted ml-0.5">
                    {m.meaning || m.pos.split("\u30FB")[0]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Translation input (pre-grade) */}
      {!gradeResult && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 animate-slide-up">
          <div className="text-xs font-bold text-text-secondary tracking-wider">
            現代語訳を書こう
          </div>
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="ここに訳を入力..."
            rows={3}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:border-sumi-dark outline-none resize-none"
          />
          <button
            type="button"
            onClick={handleGrade}
            disabled={userText.trim().length === 0}
            className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide self-center transition-opacity disabled:opacity-30"
          >
            採点
          </button>
        </div>
      )}

      {/* Grade result */}
      {gradeResult && gradeInfo && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {/* Grade badge */}
          <div
            className={`border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 ${gradeInfo.bgClass} ${gradeInfo.borderClass}`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${gradeInfo.colorClass}`}>
                {gradeInfo.symbol}
              </span>
              <div>
                <div className={`text-sm font-bold ${gradeInfo.colorClass}`}>
                  {gradeInfo.label}
                </div>
                <div className="text-[10px] text-muted">
                  一致率 {Math.round(gradeResult.matchRatio * 100)}%
                </div>
              </div>
            </div>

            {/* User's translation */}
            <div className="bg-white/60 border border-border/40 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted mb-0.5">あなたの訳</div>
              <div className="text-sm text-sumi-dark">{userText}</div>
            </div>

            {/* Reference translations */}
            <div className="bg-white/60 border border-border/40 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted mb-0.5">参考訳</div>
              {sentence.translations.map((t, i) => (
                <div key={i} className="text-sm text-sumi-dark leading-relaxed">
                  {t}
                </div>
              ))}
            </div>

            {/* Missing keywords hint */}
            {gradeResult.grade !== "double-circle" &&
              gradeResult.missingKeywords.length > 0 && (
                <div className="bg-form-izen/10 border border-form-izen/30 rounded-lg px-3 py-2">
                  <div className="text-[10px] text-form-izen font-bold mb-0.5">
                    ズレている可能性のある語
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gradeResult.missingKeywords.slice(0, 5).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 bg-form-izen/10 border border-form-izen/30 rounded text-form-izen"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Error reflection */}
          {gradeResult.grade !== "double-circle" && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm animate-fade-in">
              <div className="text-xs font-bold text-text-secondary tracking-wider mb-2">
                間違いの原因は?
              </div>
              <div className="flex flex-col gap-1.5">
                {ERROR_CHOICES.map((choice) => (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => setErrorType(choice.key)}
                    className={`w-full text-left border rounded-lg px-3 py-2 transition-all ${
                      errorType === choice.key
                        ? "bg-shu/10 border-shu/40"
                        : "bg-washi border-border"
                    }`}
                  >
                    <div className="text-sm font-bold text-sumi-dark">{choice.label}</div>
                    <div className="text-[10px] text-muted">{choice.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Next button */}
          <button
            type="button"
            onClick={handleNext}
            className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide self-center"
          >
            次の文へ
          </button>
        </div>
      )}
    </div>
  );
}
