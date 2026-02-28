import { useState, useCallback, useMemo } from "react";
import { VERB_TYPES, type VerbTypeEntry } from "../../data/verb-types.ts";
import { FORM_HEX_MAP } from "../../data/constants.ts";
import type { ConjugationType } from "../../types/core.ts";

type Step = 1 | 2 | 3 | "result";

interface VowelOption {
  label: string;
  vowel: string;
  types: ConjugationType[];
}

const VOWEL_OPTIONS: VowelOption[] = [
  {
    label: "ア段 (a)",
    vowel: "a",
    types: ["四段活用"],
  },
  {
    label: "イ段 (i)",
    vowel: "i",
    types: ["上一段活用", "上二段活用"],
  },
  {
    label: "エ段 (e)",
    vowel: "e",
    types: ["下一段活用", "下二段活用"],
  },
];

/** Map kana endings to vowel rows for 未然形. */
const KANA_TO_VOWEL: Record<string, string> = {
  // ア段
  か: "a", が: "a", さ: "a", た: "a", な: "a", は: "a", ま: "a", ら: "a", わ: "a",
  // イ段
  き: "i", ぎ: "i", し: "i", ち: "i", に: "i", ひ: "i", み: "i", り: "i", ゐ: "i",
  // エ段
  け: "e", げ: "e", せ: "e", て: "e", ね: "e", へ: "e", め: "e", れ: "e", ゑ: "e",
  // オ段 (for カ変 こ)
  こ: "o", ご: "o", そ: "o", と: "o", の: "o", ほ: "o", も: "o", ろ: "o", を: "o",
};

/** Determine the correct vowel row for a verb's 未然形 ending. */
function getCorrectVowel(verb: VerbTypeEntry): string {
  const mizen = verb.forms["未然形"];
  // For multi-char endings, use the last char
  const lastChar = mizen.charAt(mizen.length - 1);
  return KANA_TO_VOWEL[lastChar] ?? "?";
}

/** Determine if verb is a 変格活用 type. */
function isHenkaku(verb: VerbTypeEntry): boolean {
  return verb.type.includes("変格");
}

function pickRandom(exclude?: string): VerbTypeEntry {
  const candidates = exclude
    ? VERB_TYPES.filter((v) => v.id !== exclude)
    : VERB_TYPES;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function TypeIdentification() {
  const [verb, setVerb] = useState<VerbTypeEntry>(() => pickRandom());
  const [step, setStep] = useState<Step>(1);
  const [mizenInput, setMizenInput] = useState("");
  const [mizenCorrect, setMizenCorrect] = useState<boolean | null>(null);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);
  const [vowelCorrect, setVowelCorrect] = useState<boolean | null>(null);
  const [typeCorrect, setTypeCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const correctVowel = useMemo(() => getCorrectVowel(verb), [verb]);
  const henkaku = useMemo(() => isHenkaku(verb), [verb]);
  const mizenColor = FORM_HEX_MAP["未然形"];

  /** Step 1: Check the 未然形 input. */
  const handleStep1 = useCallback(() => {
    const trimmed = mizenInput.trim();
    const correct = trimmed === verb.forms["未然形"];
    setMizenCorrect(correct);

    // For 変格活用 verbs, skip directly to result
    if (henkaku) {
      setStep("result");
      if (correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setWrongCount((c) => c + 1);
      }
    } else {
      setStep(2);
    }
  }, [mizenInput, verb, henkaku]);

  /** Step 2: Select the vowel row. */
  const handleStep2 = useCallback(
    (vowel: string) => {
      setSelectedVowel(vowel);
      const isCorrectVowel = vowel === correctVowel;
      setVowelCorrect(isCorrectVowel);
      setStep(3);
    },
    [correctVowel],
  );

  /** Step 3: Determine the type options based on vowel, then select. */
  const typeOptions = useMemo((): ConjugationType[] => {
    if (!selectedVowel) return [];
    const opt = VOWEL_OPTIONS.find((o) => o.vowel === selectedVowel);
    return opt?.types ?? [];
  }, [selectedVowel]);

  const handleStep3 = useCallback(
    (guess: ConjugationType) => {
      const correct = guess === verb.type;
      setTypeCorrect(correct);
      if (correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setWrongCount((c) => c + 1);
      }
      setStep("result");
    },
    [verb.type],
  );

  const handleNext = useCallback(() => {
    const next = pickRandom(verb.id);
    setVerb(next);
    setStep(1);
    setMizenInput("");
    setMizenCorrect(null);
    setSelectedVowel(null);
    setVowelCorrect(null);
    setTypeCorrect(null);
  }, [verb.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && step === 1 && mizenInput.trim()) {
        handleStep1();
      }
    },
    [step, mizenInput, handleStep1],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted tracking-wider">種類判別</span>
        {(correctCount > 0 || wrongCount > 0) && (
          <div className="flex gap-2 text-xs">
            <span className="text-correct">{correctCount} 正解</span>
            <span className="text-incorrect">{wrongCount} 不正解</span>
          </div>
        )}
      </div>

      {/* Verb display */}
      <div className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm text-center">
        <div className="text-xs text-muted tracking-widest mb-1">
          この動詞の活用の種類は？
        </div>
        <div className="text-3xl font-black text-sumi-dark tracking-wider">
          {verb.representative}
        </div>
        {verb.stem && (
          <div className="text-xs text-text-secondary mt-1">
            語幹: {verb.stem}
          </div>
        )}
      </div>

      {/* Step 1: 未然形 input */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 animate-fade-in">
          <div className="text-xs text-muted tracking-wider">
            Step 1: 「ず」をつけると？
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-sumi-dark">{verb.stem}</span>
            <input
              type="text"
              value={mizenInput}
              onChange={(e) => setMizenInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="未然形の語尾..."
              className="border border-border rounded px-2 py-1 text-sm bg-white focus:border-sumi-dark outline-none flex-1 min-w-0"
              autoComplete="off"
              autoFocus
            />
            <span className="text-sm text-muted">+ ず</span>
          </div>
          <button
            type="button"
            onClick={handleStep1}
            disabled={!mizenInput.trim()}
            className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm tracking-wide self-center disabled:opacity-40"
          >
            確認 →
          </button>
        </div>
      )}

      {/* Step 1 feedback (shown in steps 2, 3, result) */}
      {step !== 1 && mizenCorrect !== null && (
        <div
          className={`rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${
            mizenCorrect
              ? "bg-correct/10 border border-correct text-correct"
              : "bg-incorrect/10 border border-incorrect text-incorrect"
          }`}
        >
          <span className="font-bold">Step 1:</span>
          {mizenCorrect ? (
            <span>
              {verb.stem}
              <strong style={{ color: mizenColor }}>
                {verb.forms["未然形"]}
              </strong>
              ず -- 正解
            </span>
          ) : (
            <span>
              正しくは {verb.stem}
              <strong style={{ color: mizenColor }}>
                {verb.forms["未然形"]}
              </strong>
              ず
            </span>
          )}
        </div>
      )}

      {/* Step 2: Vowel row selection */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 animate-fade-in">
          <div className="text-xs text-muted tracking-wider">
            Step 2: その音は？
          </div>
          <div className="text-xs text-text-secondary">
            「{verb.forms["未然形"]}」は何段の音？
          </div>
          <div className="flex gap-2 justify-center">
            {VOWEL_OPTIONS.map((opt) => (
              <button
                key={opt.vowel}
                type="button"
                onClick={() => handleStep2(opt.vowel)}
                className="bg-card text-sumi-dark border border-border px-4 py-2 rounded-md text-sm hover:bg-sumi-dark hover:text-washi transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 feedback (shown in step 3, result) */}
      {(step === 3 || step === "result") &&
        vowelCorrect !== null &&
        selectedVowel && (
          <div
            className={`rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${
              vowelCorrect
                ? "bg-correct/10 border border-correct text-correct"
                : "bg-incorrect/10 border border-incorrect text-incorrect"
            }`}
          >
            <span className="font-bold">Step 2:</span>
            {vowelCorrect ? (
              <span>
                {VOWEL_OPTIONS.find((o) => o.vowel === selectedVowel)?.label} --
                正解
              </span>
            ) : (
              <span>
                正しくは{" "}
                {VOWEL_OPTIONS.find((o) => o.vowel === correctVowel)?.label}
              </span>
            )}
          </div>
        )}

      {/* Step 3: Type selection */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2 animate-fade-in">
          <div className="text-xs text-muted tracking-wider">
            Step 3: 活用の種類は？
          </div>
          <div className="flex flex-col gap-1.5">
            {typeOptions.length > 1 ? (
              typeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleStep3(t)}
                  className="bg-card text-sumi-dark border border-border px-4 py-2 rounded-md text-sm hover:bg-sumi-dark hover:text-washi transition-all text-left"
                >
                  {t}
                </button>
              ))
            ) : (
              /* Single option, auto-select */
              <button
                type="button"
                onClick={() => {
                  if (typeOptions.length === 1) handleStep3(typeOptions[0]);
                }}
                className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm text-center"
              >
                {typeOptions[0]} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-3 animate-slide-up">
          {/* Correct answer flow */}
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted tracking-wider">
              正解の判別フロー
            </div>
            <div className="bg-washi border border-border rounded-lg p-3 text-xs leading-loose">
              <div>
                1. {verb.representative} +「ず」→ {verb.stem}
                <strong style={{ color: mizenColor }}>
                  {verb.forms["未然形"]}
                </strong>
                ず
              </div>
              {henkaku ? (
                <div>
                  2. {verb.type}（特殊な活用 →
                  そのまま覚える）
                </div>
              ) : (
                <>
                  <div>
                    2. 「{verb.forms["未然形"]}」は{" "}
                    {VOWEL_OPTIONS.find((o) => o.vowel === correctVowel)?.label}{" "}
                    の音
                  </div>
                  <div>
                    3. {correctVowel === "a" && "ア段 → "}
                    {correctVowel === "i" && "イ段 → "}
                    {correctVowel === "e" && "エ段 → "}
                    <strong>{verb.type}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Final verdict */}
          {typeCorrect !== null && (
            <div
              className={`text-center text-sm font-bold ${
                typeCorrect ? "text-correct" : "text-incorrect"
              }`}
            >
              {typeCorrect ? "正解!" : `不正解 -- 正答: ${verb.type}`}
            </div>
          )}
          {/* 変格 result (no step 3 was shown) */}
          {henkaku && typeCorrect === null && (
            <div className="text-center text-sm font-bold text-text-secondary">
              {verb.type}は変格活用（特殊型）
            </div>
          )}

          {/* Mnemonic if available */}
          {verb.mnemonic && (
            <div className="bg-washi border border-border rounded-lg px-3 py-2 text-xs text-text-secondary text-center">
              {verb.mnemonic}
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide self-center"
          >
            次の問題 →
          </button>
        </div>
      )}
    </div>
  );
}
