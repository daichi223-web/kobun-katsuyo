import { useState } from "react";
import { FORM_PAIRS } from "../../data/form-pairs.ts";
import { FORM_HEX_MAP, SIX_FORMS_OVERVIEW } from "../../data/constants.ts";
import type { VerbForm } from "../../types/core.ts";

export function PairsPhase() {
  const [pairIdx, setPairIdx] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [openForm, setOpenForm] = useState<VerbForm | null>(null);
  const pair = FORM_PAIRS[pairIdx];
  const leftColor = FORM_HEX_MAP[pair.left.form];
  const rightColor = FORM_HEX_MAP[pair.right.form];

  return (
    <div className="flex flex-col gap-3 items-center">
      <h2 className="text-base font-bold text-sumi-dark tracking-wider text-center border-b-2 border-border pb-2 w-full">
        活用形は「対」で理解する
      </h2>

      {/* Pair selector */}
      <div className="flex gap-2 justify-center">
        {FORM_PAIRS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPairIdx(i);
              setShowDetail(false);
            }}
            className={`px-4 py-1.5 border rounded-full text-sm transition-all ${
              pairIdx === i
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border"
            }`}
          >
            {p.left.form} ↔ {p.right.form}
          </button>
        ))}
      </div>

      {/* Pair card */}
      <div className="bg-card border border-border rounded-xl px-4 py-4 w-full shadow-sm flex flex-col gap-3 items-center">
        <div className="flex gap-3 w-full items-stretch">
          <div
            className="flex-1 border-2 rounded-lg p-3 flex flex-col gap-1 items-center text-center"
            style={{ borderColor: leftColor }}
          >
            <span className="text-base font-black" style={{ color: leftColor }}>
              {pair.left.form}
            </span>
            <span className="text-xs text-text-secondary">{pair.left.desc}</span>
            <span className="text-sm font-semibold italic" style={{ color: leftColor }}>
              {pair.left.example}
            </span>
          </div>

          <div className="flex items-center shrink-0">
            <span className="text-lg text-muted font-bold">↔</span>
          </div>

          <div
            className="flex-1 border-2 rounded-lg p-3 flex flex-col gap-1 items-center text-center"
            style={{ borderColor: rightColor }}
          >
            <span className="text-base font-black" style={{ color: rightColor }}>
              {pair.right.form}
            </span>
            <span className="text-xs text-text-secondary">{pair.right.desc}</span>
            <span className="text-sm font-semibold italic" style={{ color: rightColor }}>
              {pair.right.example}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted tracking-wide italic text-center">
          {pair.contrast}
        </p>

        <button
          type="button"
          onClick={() => setShowDetail((d) => !d)}
          className="bg-sumi-dark text-washi px-6 py-2 rounded-md text-sm tracking-wide"
        >
          {showDetail ? "閉じる" : "どう違う？"}
        </button>

        {showDetail && (
          <div className="w-full flex flex-col gap-3 animate-fade-in">
            <div
              className="border-2 rounded-lg p-3 flex flex-col gap-1"
              style={{
                borderColor: leftColor,
                backgroundColor: leftColor + "12",
              }}
            >
              <span className="font-bold text-sm" style={{ color: leftColor }}>
                {pair.left.form}
              </span>
              <span className="text-xs text-sumi-dark leading-relaxed">{pair.leftResult}</span>
            </div>
            <div
              className="border-2 rounded-lg p-3 flex flex-col gap-1"
              style={{
                borderColor: rightColor,
                backgroundColor: rightColor + "12",
              }}
            >
              <span className="font-bold text-sm" style={{ color: rightColor }}>
                {pair.right.form}
              </span>
              <span className="text-xs text-sumi-dark leading-relaxed">{pair.rightResult}</span>
            </div>

            {pairIdx === 0 && (
              <div className="bg-washi border border-border rounded-lg p-3 text-xs leading-loose text-sumi-dark">
                「雨降ら<strong>ば</strong>」（未然）→ もし雨が降るなら
                <br />
                「雨降れ<strong>ば</strong>」（已然）→ 雨が降るので
                <br />
                <em className="text-muted">活用形だけが意味を変えている。</em>
              </div>
            )}

            {pairIdx === 1 && (
              <div className="bg-washi border border-border rounded-lg p-3 text-xs leading-loose text-sumi-dark">
                「花<strong>咲き</strong>けり」→ 咲き＝連用形 → けり（過去）がつく → 花が咲いた
                <br />
                「花<strong>咲く</strong>野辺」→ 咲く＝連体形 → 野辺（名詞）を修飾 → 花が咲く野辺
                <br />
                <em className="text-muted">読解では、動詞の後ろに何が来ているかで連用形か連体形かを判断する。</em>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Six forms overview — tap to expand */}
      <div className="w-full bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="text-xs text-muted tracking-wider mb-3 text-center">
          六つの活用形 — タップで解説
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SIX_FORMS_OVERVIEW.map((f) => {
            const fColor = FORM_HEX_MAP[f.form];
            const isOpen = openForm === f.form;
            return (
              <button
                key={f.form}
                type="button"
                onClick={() => setOpenForm(isOpen ? null : f.form)}
                className="border-2 rounded-lg p-2 flex flex-col gap-0.5 text-left transition-all"
                style={{
                  borderColor: fColor,
                  backgroundColor: isOpen ? fColor + "20" : fColor + "0d",
                  boxShadow: isOpen ? `0 0 0 2px ${fColor}40` : "none",
                }}
              >
                <span className="text-xs font-black" style={{ color: fColor }}>
                  {f.form}
                </span>
                <span className="text-[10px] text-text-secondary leading-tight">
                  {f.desc}
                </span>
              </button>
            );
          })}
        </div>

        {openForm && (() => {
          const info = SIX_FORMS_OVERVIEW.find((f) => f.form === openForm)!;
          const fColor = FORM_HEX_MAP[openForm];
          return (
            <div
              className="mt-3 border-2 rounded-lg p-3 flex flex-col gap-2 animate-fade-in"
              style={{ borderColor: fColor, backgroundColor: fColor + "10" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-black" style={{ color: fColor }}>
                  {info.form}
                </span>
                <span className="text-xs text-muted">接続: {info.acc}</span>
              </div>
              <p className="text-sm text-sumi-dark leading-relaxed">
                {info.detail}
              </p>
              <div
                className="text-sm font-semibold px-2 py-1 rounded w-fit"
                style={{ color: fColor, backgroundColor: fColor + "18" }}
              >
                {info.example}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
