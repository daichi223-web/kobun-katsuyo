import { useState, useCallback, useMemo } from "react";

// ─── Types ───

interface IdentificationOption {
  label: string;
  explanation: string;
  isCorrect: boolean;
}

interface IdentificationQuestion {
  group: string;
  sentence: string;
  highlight: string;
  question: string;
  options: IdentificationOption[];
  keyEvidence: string;
}

// ─── Question Data ───

const QUESTIONS: IdentificationQuestion[] = [
  // ── 「ぬ」: 打消ず連体形 vs 完了ぬ終止形 ──
  {
    group: "ぬ",
    sentence: "風吹かぬ日",
    highlight: "ぬ",
    question: "この「ぬ」は何か？",
    options: [
      {
        label: "打消「ず」の連体形",
        explanation:
          "「ぬ」の直後に体言「日」がある。体言に接続する＝連体形。「ず」の連体形が「ぬ」。",
        isCorrect: true,
      },
      {
        label: "完了「ぬ」の終止形",
        explanation:
          "完了「ぬ」なら文末で言い切る形。ここは直後に「日」（体言）が続いているので不適。",
        isCorrect: false,
      },
    ],
    keyEvidence: "直後に体言「日」→ 連体形 → 打消「ず」の連体形「ぬ」",
  },
  {
    group: "ぬ",
    sentence: "花散りぬ。",
    highlight: "ぬ",
    question: "この「ぬ」は何か？",
    options: [
      {
        label: "打消「ず」の連体形",
        explanation:
          "打消「ず」の連体形なら直後に体言が必要。ここは文末「。」で終わっている。",
        isCorrect: false,
      },
      {
        label: "完了「ぬ」の終止形",
        explanation:
          "文末で言い切っている。「散り」は連用形で、完了「ぬ」は連用形接続。",
        isCorrect: true,
      },
    ],
    keyEvidence:
      "文末で言い切り + 直前「散り」は連用形 → 完了「ぬ」（連用形接続）",
  },
  {
    group: "ぬ",
    sentence: "月見えぬ夜",
    highlight: "ぬ",
    question: "この「ぬ」は何か？",
    options: [
      {
        label: "打消「ず」の連体形",
        explanation:
          "直後に体言「夜」。連体形で体言修飾。「見え」は下二段の未然形で、打消「ず」は未然形接続。",
        isCorrect: true,
      },
      {
        label: "完了「ぬ」の終止形",
        explanation:
          "完了「ぬ」なら文末で言い切る。直後に「夜」が続くので不適。",
        isCorrect: false,
      },
    ],
    keyEvidence:
      "直後に体言「夜」→ 連体形 → 打消「ず」の連体形 / 「見え」は未然形（ず接続OK）",
  },
  {
    group: "ぬ",
    sentence: "雨やみぬ。",
    highlight: "ぬ",
    question: "この「ぬ」は何か？",
    options: [
      {
        label: "打消「ず」の連体形",
        explanation:
          "文末なので連体形としての用法は不自然。また「やみ」は連用形。",
        isCorrect: false,
      },
      {
        label: "完了「ぬ」の終止形",
        explanation:
          "「やみ」は四段動詞「やむ」の連用形。文末で完了を表す。",
        isCorrect: true,
      },
    ],
    keyEvidence:
      "文末言い切り + 「やみ」連用形 → 完了「ぬ」（連用形接続・終止形）",
  },

  // ── 「なり」: 断定 vs 推定 ──
  {
    group: "なり",
    sentence: "男なり。",
    highlight: "なり",
    question: "この「なり」は何か？",
    options: [
      {
        label: "断定の「なり」",
        explanation:
          "直前が体言「男」。断定「なり」は体言・連体形に接続する。",
        isCorrect: true,
      },
      {
        label: "推定の「なり」",
        explanation:
          "推定「なり」は終止形（ラ変は連体形）に接続。「男」は体言なので不適。",
        isCorrect: false,
      },
    ],
    keyEvidence: "直前が体言「男」→ 体言接続 → 断定の「なり」",
  },
  {
    group: "なり",
    sentence: "すなるもの",
    highlight: "なる",
    question: "この「なる」は何か？",
    options: [
      {
        label: "断定の「なり」の連体形",
        explanation:
          "断定なら体言・連体形接続。「す」はサ変終止形。終止形接続は推定。",
        isCorrect: false,
      },
      {
        label: "推定の「なり」の連体形",
        explanation:
          "「す」はサ変動詞の終止形。終止形接続＝推定「なり」。「もの」修飾で連体形。",
        isCorrect: true,
      },
    ],
    keyEvidence:
      "直前「す」はサ変終止形 → 終止形接続 → 推定の「なり」",
  },
  {
    group: "なり",
    sentence: "静かなり。",
    highlight: "なり",
    question: "この「なり」は何か？",
    options: [
      {
        label: "断定の「なり」",
        explanation:
          "「静か」は形容動詞の語幹。形容動詞語幹+「なり」は断定のナリ活用そのもの。",
        isCorrect: true,
      },
      {
        label: "推定の「なり」",
        explanation:
          "推定なら終止形接続が必要。「静か」は活用語の終止形ではない。",
        isCorrect: false,
      },
    ],
    keyEvidence: "形容動詞語幹「静か」+ なり → 断定（ナリ活用）",
  },
  {
    group: "なり",
    sentence: "鐘なるなり。",
    highlight: "なり",
    question: "文末の「なり」は何か？",
    options: [
      {
        label: "断定の「なり」",
        explanation:
          "「なる」が連体形なら断定の可能性はあるが、「鐘なる」＝鐘が鳴る、は音に関する内容。",
        isCorrect: false,
      },
      {
        label: "推定の「なり」",
        explanation:
          "「鐘なる」＝鐘が鳴っている。音・聴覚に関する内容は推定「なり」の決め手。終止形接続。",
        isCorrect: true,
      },
    ],
    keyEvidence:
      "「鐘が鳴る」＝聴覚情報 → 推定「なり」（音に関する内容は推定の手がかり）",
  },

  // ── 「し」: 過去き連体形 vs 形容詞語尾 vs サ変連用形 ──
  {
    group: "し",
    sentence: "去りし人",
    highlight: "し",
    question: "この「し」は何か？",
    options: [
      {
        label: "過去「き」の連体形",
        explanation:
          "直後に体言「人」→ 連体形。「去り」は連用形で「き」は連用形接続。「き」の連体形が「し」。",
        isCorrect: true,
      },
      {
        label: "形容詞シク活用の語尾",
        explanation:
          "「去る」は動詞であり形容詞ではない。「去りし」は動詞連用形+過去。",
        isCorrect: false,
      },
      {
        label: "サ変動詞「す」の連用形",
        explanation:
          "「去り」は四段動詞の連用形。サ変動詞「す」とは関係ない。",
        isCorrect: false,
      },
    ],
    keyEvidence:
      "「去り」（動詞連用形）+ し + 「人」（体言）→ 過去「き」の連体形「し」",
  },
  {
    group: "し",
    sentence: "美しき花",
    highlight: "し",
    question: "「美しき」の「し」は何か？",
    options: [
      {
        label: "過去「き」の連体形",
        explanation:
          "「美しき」全体が形容詞の連体形。「し」は過去ではなく形容詞の活用語尾。",
        isCorrect: false,
      },
      {
        label: "形容詞シク活用の語尾",
        explanation:
          "「美し」はシク活用形容詞。「美しき」は連体形で「花」を修飾。「し」は形容詞の語幹の一部。",
        isCorrect: true,
      },
      {
        label: "サ変動詞「す」の連用形",
        explanation: "「美し」は形容詞であり、サ変動詞とは無関係。",
        isCorrect: false,
      },
    ],
    keyEvidence:
      "「美し」はシク活用形容詞 → 「し」は形容詞語幹の一部（助動詞ではない）",
  },
  {
    group: "し",
    sentence: "旅をしけり。",
    highlight: "し",
    question: "この「し」は何か？",
    options: [
      {
        label: "過去「き」の連体形",
        explanation:
          "「き」の連体形「し」の直後は体言が来るはず。ここは「けり」が続く。",
        isCorrect: false,
      },
      {
        label: "形容詞シク活用の語尾",
        explanation:
          "「旅をし」は「旅をする」の意。動詞「す」であり形容詞ではない。",
        isCorrect: false,
      },
      {
        label: "サ変動詞「す」の連用形",
        explanation:
          "「旅をす」のサ変動詞「す」の連用形が「し」。「けり」は連用形接続。",
        isCorrect: true,
      },
    ],
    keyEvidence:
      "「旅をす」（サ変動詞） → 連用形「し」+ 「けり」（連用形接続）",
  },
];

const GROUPS = ["ぬ", "なり", "し"] as const;

/** Render sentence with first occurrence of highlight marked. */
function renderHighlight(sentence: string, highlight: string) {
  const idx = sentence.indexOf(highlight);
  if (idx === -1) return <span>{sentence}</span>;
  return (
    <>
      <span>{sentence.slice(0, idx)}</span>
      <span className="font-black text-shu underline decoration-2 underline-offset-4">
        {highlight}
      </span>
      <span>{sentence.slice(idx + highlight.length)}</span>
    </>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DrillState = "idle" | "question" | "answered" | "finished";

export function IdentificationDrill() {
  const [groupFilter, setGroupFilter] = useState<
    (typeof GROUPS)[number] | "all"
  >("all");
  const [drillState, setDrillState] = useState<DrillState>("idle");
  const [queue, setQueue] = useState<IdentificationQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [missedIds, setMissedIds] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (groupFilter === "all") return QUESTIONS;
    return QUESTIONS.filter((q) => q.group === groupFilter);
  }, [groupFilter]);

  const current = queue[currentIdx] as IdentificationQuestion | undefined;

  const startDrill = useCallback(() => {
    // Priority: repeat missed items more by duplicating them
    let pool = shuffle(filtered);
    if (missedIds.size > 0) {
      const missed = QUESTIONS.filter((_, i) => missedIds.has(i));
      const extra = shuffle(missed);
      pool = shuffle([...pool, ...extra]);
    }
    setQueue(pool);
    setCurrentIdx(0);
    setSelectedOption(null);
    setStats({ correct: 0, total: 0 });
    setMissedIds(new Set());
    setDrillState("question");
  }, [filtered, missedIds]);

  const handleSelect = useCallback(
    (optionIdx: number) => {
      if (drillState !== "question" || !current) return;
      setSelectedOption(optionIdx);
      const isCorrect = current.options[optionIdx].isCorrect;
      setStats((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      if (!isCorrect) {
        // Track the original question index for priority repetition
        const origIdx = QUESTIONS.indexOf(current);
        if (origIdx >= 0) {
          setMissedIds((prev) => new Set(prev).add(origIdx));
        }
      }
      setDrillState("answered");
    },
    [drillState, current],
  );

  const nextQuestion = useCallback(() => {
    setSelectedOption(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= queue.length) {
      setDrillState("finished");
    } else {
      setCurrentIdx(nextIdx);
      setDrillState("question");
    }
  }, [currentIdx, queue.length]);

  return (
    <div className="flex flex-col gap-2">
      {/* Group filter */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            setGroupFilter("all");
            setDrillState("idle");
          }}
          className={`flex-1 px-2 py-1.5 border rounded text-xs transition-all ${
            groupFilter === "all"
              ? "bg-sumi-dark text-washi border-sumi-dark"
              : "bg-card text-text-secondary border-border"
          }`}
        >
          全て
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGroupFilter(g);
              setDrillState("idle");
            }}
            className={`flex-1 px-2 py-1.5 border rounded text-xs transition-all ${
              groupFilter === g
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

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
            {Math.round((stats.correct / stats.total) * 100)}%
          </span>
        </div>
      )}

      {/* Idle */}
      {drillState === "idle" && (
        <div className="bg-card border border-border rounded-xl px-4 py-5 shadow-sm text-center flex flex-col gap-3 items-center">
          <div className="text-xs text-muted tracking-wider">重要識別ドリル</div>
          <p className="text-xs text-text-secondary leading-relaxed">
            紛らわしい同形語を文脈から見分ける
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {GROUPS.map((g) => (
              <span
                key={g}
                className="text-[11px] text-text-secondary border border-border rounded-full px-2 py-0.5"
              >
                「{g}」の識別
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted">
            {filtered.length}問
            {missedIds.size > 0 && ` (苦手${missedIds.size}問を重点出題)`}
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

      {/* Question / Answered */}
      {(drillState === "question" || drillState === "answered") && current && (
        <div className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm flex flex-col gap-3 animate-slide-up">
          {/* Progress */}
          <div className="flex justify-between items-center text-[10px] text-muted">
            <span>
              {currentIdx + 1} / {queue.length}
            </span>
            <span className="border border-border rounded-full px-2 py-0.5">
              「{current.group}」の識別
            </span>
          </div>

          {/* Context sentence */}
          <div className="bg-washi border border-border rounded-lg px-3 py-3 text-center">
            <span className="text-base text-sumi-dark leading-relaxed tracking-wide">
              {renderHighlight(current.sentence, current.highlight)}
            </span>
          </div>

          {/* Question */}
          <div className="text-sm font-bold text-sumi-dark text-center">
            {current.question}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-1.5">
            {current.options.map((opt, i) => {
              let optStyle = "border-border bg-card";
              if (drillState === "answered") {
                if (opt.isCorrect) {
                  optStyle = "border-correct bg-correct/10";
                } else if (i === selectedOption && !opt.isCorrect) {
                  optStyle = "border-incorrect bg-incorrect/10";
                } else {
                  optStyle = "border-border bg-card opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={drillState === "answered"}
                  className={`border rounded-lg px-3 py-2.5 text-left transition-all ${optStyle} ${
                    drillState === "question"
                      ? "hover:bg-washi active:scale-[0.98]"
                      : ""
                  }`}
                >
                  <div className="text-sm text-sumi-dark font-semibold">
                    {opt.label}
                  </div>
                  {drillState === "answered" && (
                    <div className="text-[11px] text-text-secondary mt-1 leading-relaxed animate-fade-in">
                      {opt.explanation}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Key evidence - shown after answering */}
          {drillState === "answered" && (
            <div className="bg-washi border border-border rounded-lg px-3 py-2 animate-fade-in">
              <div className="text-[10px] text-muted tracking-wider mb-0.5">
                決め手
              </div>
              <div className="text-xs text-sumi-dark font-semibold leading-relaxed">
                {current.keyEvidence}
              </div>
            </div>
          )}

          {/* Next button */}
          {drillState === "answered" && (
            <button
              type="button"
              onClick={nextQuestion}
              className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm w-full"
            >
              次へ
            </button>
          )}
        </div>
      )}

      {/* Finished */}
      {drillState === "finished" && (
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
            %
          </div>
          {missedIds.size > 0 && (
            <div className="text-[10px] text-muted">
              次回は苦手な{missedIds.size}問を重点出題します
            </div>
          )}
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
