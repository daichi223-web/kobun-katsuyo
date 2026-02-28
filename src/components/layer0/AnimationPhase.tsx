import { useState, useCallback } from "react";
import { VERB_EXAMPLES } from "../../data/verbs.ts";
import { FORM_HEX_MAP } from "../../data/constants.ts";

interface AnimationPhaseProps {
  onNext?: () => void;
}

export function AnimationPhase({ onNext }: AnimationPhaseProps) {
  const [verbIdx, setVerbIdx] = useState(0);
  const [formIdx, setFormIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const verb = VERB_EXAMPLES[verbIdx];
  const form = verb.forms[formIdx];
  const color = FORM_HEX_MAP[form.form];

  const handleNextForm = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setFormIdx((f) => (f + 1) % verb.forms.length);
      setAnimating(false);
    }, 300);
  }, [animating, verb.forms.length]);

  const handleNextVerb = useCallback(() => {
    setVerbIdx((v) => (v + 1) % VERB_EXAMPLES.length);
    setFormIdx(0);
  }, []);

  return (
    <div className="flex flex-col gap-3 items-center">
      <h2 className="text-base font-bold text-sumi-dark tracking-wider text-center border-b-2 border-border pb-2 w-full">
        後ろの語が形を要求している
      </h2>

      {/* Type selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {VERB_EXAMPLES.map((v, i) => (
          <button
            key={v.base}
            type="button"
            onClick={() => {
              setVerbIdx(i);
              setFormIdx(0);
            }}
            className={`flex flex-col items-center px-4 py-1.5 border rounded-lg text-base transition-all ${
              verbIdx === i
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border hover:border-sumi-dark"
            }`}
          >
            {v.type}
            <span className="text-[10px] opacity-60 tracking-wide leading-none">
              {v.base}
            </span>
          </button>
        ))}
      </div>

      {/* Causation card — 3-step display */}
      <div className="bg-card border border-border rounded-xl px-4 py-4 w-full shadow-sm flex flex-col gap-3">
        {/* Step 1: 後ろの語 */}
        <div
          className="flex items-center gap-2 transition-all duration-300"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <span className="text-[10px] text-muted w-16 shrink-0">① 後ろの語</span>
          <span className="text-2xl font-black" style={{ color }}>
            {form.particle}
          </span>
          <span className="text-xs text-muted">
            （{form.particleMeaning}）
          </span>
        </div>

        {/* Step 2: 要求する形 */}
        <div
          className="border-2 rounded-lg px-3 py-2 flex items-center gap-2 transition-all duration-300"
          style={{
            borderColor: color,
            backgroundColor: color + "15",
            opacity: animating ? 0 : 1,
          }}
        >
          <span className="text-[10px] text-muted w-16 shrink-0">② 要求する形</span>
          <span className="text-lg font-black" style={{ color }}>
            {form.form}
          </span>
          <span className="text-xs text-text-secondary">{form.meaning}</span>
        </div>

        {/* Step 3: 結果 */}
        <div
          className="flex items-center gap-2 transition-all duration-300"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <span className="text-[10px] text-muted w-16 shrink-0">③ 結果</span>
          <span className="text-3xl font-black text-sumi-dark">{verb.stem}</span>
          <span className="text-lg text-muted">→</span>
          <span className="text-3xl font-black text-sumi-dark">{verb.stem}</span>
          <span
            className="text-3xl font-black"
            style={{ color }}
          >
            {form.ending}
          </span>
          <span className="text-xl font-bold ml-1" style={{ color }}>
            {form.particle}
          </span>
        </div>
      </div>

      {/* Form dots + buttons */}
      <div className="flex items-center gap-4 w-full justify-center">
        <div className="flex gap-2">
          {verb.forms.map((f, i) => (
            <button
              key={f.form}
              type="button"
              onClick={() => setFormIdx(i)}
              title={f.form}
              className="w-2.5 h-2.5 rounded-full border-none transition-all"
              style={{
                backgroundColor:
                  formIdx === i ? FORM_HEX_MAP[f.form] : "#ddd",
                transform: formIdx === i ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleNextForm}
          className="bg-sumi-dark text-washi px-5 py-2 rounded-md text-sm tracking-wide"
        >
          次の形 →
        </button>
        <button
          type="button"
          onClick={handleNextVerb}
          className="text-text-secondary border border-border px-4 py-2 rounded-md text-sm tracking-wide hover:border-sumi-dark"
        >
          別の活用
        </button>
      </div>

      {/* All forms */}
      <div className="flex gap-1.5 flex-wrap justify-center w-full">
        {verb.forms.map((f, i) => {
          const fColor = FORM_HEX_MAP[f.form];
          return (
            <button
              key={f.form}
              type="button"
              onClick={() => setFormIdx(i)}
              className="border-2 rounded-lg px-3 py-1.5 flex flex-col items-center transition-all cursor-pointer"
              style={{
                borderColor: formIdx === i ? fColor : "#e0d8cc",
                backgroundColor:
                  formIdx === i ? fColor + "18" : "transparent",
              }}
            >
              <span style={{ color: fColor }} className="font-bold text-base">
                {verb.stem}
                {f.ending}
              </span>
              <span className="text-[10px] text-muted leading-none">
                {f.form}
              </span>
            </button>
          );
        })}
      </div>

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="mt-4 bg-sumi-dark text-washi px-6 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
        >
          対比へ進む →
        </button>
      )}
    </div>
  );
}
