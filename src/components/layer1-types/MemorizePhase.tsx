import { useState, useCallback, useMemo } from "react";

interface MemorizePhaseProps {
  onNext: () => void;
}

interface QuizCard {
  question: string;
  answer: string[];
  hint?: string;
  category: "上一段" | "下一段" | "カ変" | "サ変" | "ナ変" | "ラ変";
}

const QUIZ_CARDS: QuizCard[] = [
  {
    question: "上一段活用の動詞は？（語呂合わせで覚えよう）",
    answer: ["ひ", "い", "き", "に", "み", "ゐ"],
    hint: "「ひいきにみゐる」",
    category: "上一段",
  },
  {
    question: "下一段活用の動詞は？",
    answer: ["蹴る"],
    hint: "たった1語！",
    category: "下一段",
  },
  {
    question: "カ行変格活用の動詞は？",
    answer: ["来"],
    hint: "1語だけ",
    category: "カ変",
  },
  {
    question: "サ行変格活用の動詞は？",
    answer: ["す", "おはす"],
    hint: "",
    category: "サ変",
  },
  {
    question: "ナ行変格活用の動詞は？",
    answer: ["死ぬ", "去ぬ"],
    hint: "2語だけ",
    category: "ナ変",
  },
  {
    question: "ラ行変格活用の動詞は？",
    answer: ["あり", "をり", "はべり", "いまそかり"],
    hint: "4語。敬語が2つ入っている",
    category: "ラ変",
  },
];

// Characters for the character pad
const CHAR_PAD_CHARS = [
  "ひ", "い", "き", "に", "み", "ゐ", "る",
  "蹴", "来", "す", "お", "は",
  "死", "ぬ", "去", "あ", "り",
  "を", "べ", "ま", "そ", "か",
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MemorizePhase({ onNext }: MemorizePhaseProps) {
  const [cardIdx, setCardIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [judged, setJudged] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const card = QUIZ_CARDS[cardIdx];

  const padChars = useMemo(() => shuffleArray(CHAR_PAD_CHARS), []);

  const handleSelect = useCallback((char: string) => {
    if (judged) return;
    setSelected((prev) => {
      if (prev.includes(char)) return prev.filter((c) => c !== char);
      return [...prev, char];
    });
  }, [judged]);

  const handleJudge = useCallback(() => {
    const correct = card.answer;
    const selectedSet = new Set(selected);
    const correctSet = new Set(correct);
    const match = selectedSet.size === correctSet.size &&
      [...selectedSet].every((s) => correctSet.has(s));
    setIsCorrect(match);
    setJudged(true);
    setScore((prev) => ({
      correct: prev.correct + (match ? 1 : 0),
      total: prev.total + 1,
    }));
  }, [card.answer, selected]);

  const handleNext = useCallback(() => {
    if (cardIdx < QUIZ_CARDS.length - 1) {
      setCardIdx((i) => i + 1);
    } else {
      setCardIdx(0);
    }
    setSelected([]);
    setJudged(false);
    setIsCorrect(false);
  }, [cardIdx]);

  const allDone = score.total >= QUIZ_CARDS.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tracking-wider">
          {cardIdx + 1} / {QUIZ_CARDS.length}
        </span>
        {score.total > 0 && (
          <span className="text-xs text-text-secondary">
            {score.correct}/{score.total} 正解
          </span>
        )}
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm">
        <p className="text-sm font-bold text-sumi-dark">{card.question}</p>
        {card.hint && (
          <p className="text-xs text-muted mt-1">ヒント: {card.hint}</p>
        )}
      </div>

      {/* Selected answer display */}
      <div className="bg-washi border border-border rounded-lg px-3 py-2 min-h-[2.5rem] flex flex-wrap gap-1.5 items-center">
        {selected.length === 0 ? (
          <span className="text-xs text-muted">下のパッドから選んでください</span>
        ) : (
          selected.map((char, i) => (
            <button
              key={`${char}-${i}`}
              type="button"
              onClick={() => !judged && setSelected((prev) => prev.filter((_, idx) => idx !== i))}
              className={`px-2.5 py-1 rounded text-sm font-bold border transition-all ${
                judged
                  ? card.answer.includes(char)
                    ? "bg-correct/15 border-correct text-correct"
                    : "bg-incorrect/15 border-incorrect text-incorrect line-through"
                  : "bg-card border-sumi-dark/30 text-sumi-dark hover:border-incorrect"
              }`}
            >
              {char}
            </button>
          ))
        )}
      </div>

      {/* Missed answers on wrong */}
      {judged && !isCorrect && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted">正解:</span>
          {card.answer.map((a) => (
            <span
              key={a}
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                selected.includes(a)
                  ? "bg-correct/15 text-correct"
                  : "bg-incorrect/15 text-incorrect"
              }`}
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Character pad — always visible */}
      <div className="bg-card border border-border rounded-xl px-3 py-3 shadow-sm">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {padChars.map((char) => {
            const isSelected = selected.includes(char);
            const isAnswer = card.answer.includes(char);
            return (
              <button
                key={char}
                type="button"
                onClick={() => handleSelect(char)}
                disabled={judged}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                  judged
                    ? isAnswer
                      ? "bg-correct/15 border-correct text-correct"
                      : isSelected
                        ? "bg-incorrect/15 border-incorrect text-incorrect"
                        : "bg-washi border-border text-muted opacity-40"
                    : isSelected
                      ? "bg-sumi-dark text-washi border-sumi-dark"
                      : "bg-washi border-border text-sumi-dark hover:border-sumi-dark/50"
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        {!judged && (
          <button
            type="button"
            onClick={handleJudge}
            disabled={selected.length === 0}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide disabled:opacity-40"
          >
            判定
          </button>
        )}

        {judged && (
          <>
            {isCorrect ? (
              <span className="text-sm font-bold text-correct">正解!</span>
            ) : (
              <span className="text-sm font-bold text-incorrect">不正解</span>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
            >
              {cardIdx < QUIZ_CARDS.length - 1 ? "次の問題 →" : "もう一周 →"}
            </button>
          </>
        )}
      </div>

      {/* Proceed to summary when done */}
      {allDone && (
        <button
          type="button"
          onClick={onNext}
          className="mt-2 bg-sumi-dark text-washi px-6 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
        >
          まとめへ →
        </button>
      )}
    </div>
  );
}
