import { CORE_SENTENCE } from "../../data/constants.ts";
import { CheckItem } from "../shared/CheckItem.tsx";

interface SummaryPhaseProps {
  onComplete?: () => void;
}

export function SummaryPhase({ onComplete }: SummaryPhaseProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-sumi-dark tracking-wider text-center border-b-2 border-border pb-2">
        理解できたか確認する
      </h2>

      {/* Core sentence */}
      <div className="bg-sumi-dark text-washi rounded-xl px-5 py-4 flex flex-col gap-1">
        <span className="text-[11px] text-muted tracking-widest">ポイント</span>
        <span className="text-base font-bold leading-relaxed tracking-wide">
          {CORE_SENTENCE}
        </span>
      </div>

      {/* Positive checklist */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2 shadow-sm">
        <div className="text-xs font-bold text-text-secondary tracking-wider border-b border-border pb-2">
          理解できたサイン
        </div>
        <CheckItem text="活用表を見て「覚えなきゃ」ではなく「確認しよう」と思う" />
        <CheckItem text="「ず」が付いているとき、なぜ未然形かを機能から説明できる" />
        <CheckItem text="未然形＋ば（仮定）と已然形＋ば（確定）の違いを即答できる" />
        <CheckItem text="知らない語でも「ずが付いているから未然形」と動ける" />
      </div>

      {/* Warning checklist */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2 shadow-sm">
        <div className="text-xs font-bold text-text-secondary tracking-wider border-b border-border pb-2">
          まだのサイン
        </div>
        <CheckItem text="「ずは未然形接続」を言えるが、なぜかは言えない" warning />
        <CheckItem text="活用形を名前で答えるが、その形が何をするかは言えない" warning />
        <CheckItem text="「ば」の仮定と確定の区別に迷う" warning />
      </div>

      {/* Next step */}
      <div className="bg-washi border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
        <span className="text-[11px] text-muted tracking-widest">次のステップ</span>
        <div className="text-sm text-sumi-dark leading-relaxed font-semibold">
          次のステップ：活用形の機能ドリルへ進む
        </div>
        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="bg-sumi-dark text-washi px-6 py-2 rounded-md text-sm tracking-wide mt-2 self-start"
          >
            ステップ 0 完了 →
          </button>
        )}
      </div>
    </div>
  );
}
