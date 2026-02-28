import { useState } from "react";
import { FORM_PAIRS } from "../../data/form-pairs.ts";
import { FORM_HEX_MAP, SIX_FORMS_OVERVIEW } from "../../data/constants.ts";

export function PairsPhase() {
  const [pairIdx, setPairIdx] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
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
            <div className="flex gap-2">
              <div
                className="flex-1 border-2 rounded-lg p-3 flex flex-col gap-1"
                style={{
                  borderColor: leftColor,
                  backgroundColor: leftColor + "12",
                }}
              >
                <span className="font-bold text-sm" style={{ color: leftColor }}>
                  {pair.left.form}
                </span>
                <span className="text-xs text-sumi-dark">{pair.leftResult}</span>
              </div>
              <div
                className="flex-1 border-2 rounded-lg p-3 flex flex-col gap-1"
                style={{
                  borderColor: rightColor,
                  backgroundColor: rightColor + "12",
                }}
              >
                <span className="font-bold text-sm" style={{ color: rightColor }}>
                  {pair.right.form}
                </span>
                <span className="text-xs text-sumi-dark">{pair.rightResult}</span>
              </div>
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
          </div>
        )}
      </div>

      {/* Six forms overview */}
      <div className="w-full bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="text-xs text-muted tracking-wider mb-2 text-center">
          六形の全体像
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SIX_FORMS_OVERVIEW.map((f) => {
            const fColor = FORM_HEX_MAP[f.form];
            return (
              <div
                key={f.form}
                className="border rounded-lg p-2 flex flex-col gap-0.5"
                style={{
                  borderColor: fColor,
                  backgroundColor: fColor + "0d",
                }}
              >
                <span
                  className="text-xs font-black"
                  style={{ color: fColor }}
                >
                  {f.form}
                </span>
                <span className="text-[10px] text-text-secondary leading-tight">
                  {f.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
