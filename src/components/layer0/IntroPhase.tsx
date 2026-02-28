import { useTypewriter } from "../../hooks/useTypewriter.ts";
import { CORE_SENTENCE } from "../../data/constants.ts";

interface IntroPhaseProps {
  onNext: () => void;
}

export function IntroPhase({ onNext }: IntroPhaseProps) {
  const { displayText, done } = useTypewriter(CORE_SENTENCE, 60);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Core card */}
      <div className="bg-card border border-border rounded-xl px-5 py-5 w-full shadow-sm flex flex-col gap-3 items-start">
        <div className="text-[11px] text-muted tracking-widest border-l-3 border-muted pl-2.5">
          最初に理解すべきこと
        </div>

        <div className="text-lg font-bold leading-relaxed text-sumi-dark tracking-wide">
          {displayText}
          <span className="text-muted animate-[blink_1s_step-end_infinite]">
            |
          </span>
        </div>

        <div
          className="text-sm leading-loose text-text-secondary transition-opacity duration-700"
          style={{ opacity: done ? 1 : 0 }}
        >
          活用表は「暗記する表」ではない。
          <br />
          後ろの語への<strong>応答パターン</strong>だ。
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!done}
          className="bg-sumi-dark text-washi px-6 py-2.5 rounded-md text-sm tracking-wide transition-opacity disabled:opacity-30"
        >
          変化を見てみる →
        </button>
      </div>

      {/* Preview chips */}
      <div className="flex gap-2 flex-wrap justify-center">
        {["か（ず）", "き（けり）", "く（人）", "け（ば）"].map((ex) => (
          <div
            key={ex}
            className="bg-card border border-border rounded-lg px-3 py-1.5"
          >
            <span className="text-sm text-sumi-dark">書{ex}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted tracking-wider">
        同じ「書く」が後ろの語によって変形する
      </div>
    </div>
  );
}
