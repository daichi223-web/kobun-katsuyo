import { useState } from "react";
import { VERB_TYPES, type VerbTypeEntry } from "../../data/verb-types.ts";
import { FORM_HEX_MAP } from "../../data/constants.ts";
import type { VerbForm } from "../../types/core.ts";

interface OverviewPhaseProps {
  onNext: () => void;
}

interface TypeGroup {
  label: string;
  desc: string;
  types: {
    name: string;
    detail: string;
    verbs: VerbTypeEntry[];
  }[];
}

const FORMS: VerbForm[] = ["未然形", "連用形", "終止形", "連体形", "已然形", "命令形"];

function getRepresentativeVerb(typeName: string): VerbTypeEntry | undefined {
  return VERB_TYPES.find((v) => v.type === typeName);
}

const GROUPS: TypeGroup[] = [
  {
    label: "多数派",
    desc: "パターンで判別できる — 動詞の大半がここ",
    types: [
      {
        name: "四段活用",
        detail: "a-i-u-u-e-e の母音パターン。最も数が多い",
        verbs: VERB_TYPES.filter((v) => v.type === "四段活用").slice(0, 2),
      },
      {
        name: "上二段活用",
        detail: "i-i-u-uru-ure-iyo。iとuの二段を使う",
        verbs: [getRepresentativeVerb("上二段活用")].filter(Boolean) as VerbTypeEntry[],
      },
      {
        name: "下二段活用",
        detail: "e-e-u-uru-ure-eyo。eとuの二段を使う",
        verbs: VERB_TYPES.filter((v) => v.type === "下二段活用").slice(0, 1),
      },
    ],
  },
  {
    label: "少数派",
    desc: "数が少ないから丸暗記",
    types: [
      {
        name: "上一段活用",
        detail: "「ひいきにみゐる」の6語だけ。iの一段のみ使う",
        verbs: [getRepresentativeVerb("上一段活用")].filter(Boolean) as VerbTypeEntry[],
      },
      {
        name: "下一段活用",
        detail: "「蹴る」の1語だけ。eの一段のみ使う",
        verbs: [getRepresentativeVerb("下一段活用")].filter(Boolean) as VerbTypeEntry[],
      },
    ],
  },
  {
    label: "変格活用",
    desc: "特別な動詞 — 不規則だから個別に覚える",
    types: [
      {
        name: "カ行変格活用",
        detail: "「来（く）」の1語だけ",
        verbs: [getRepresentativeVerb("カ行変格活用")].filter(Boolean) as VerbTypeEntry[],
      },
      {
        name: "サ行変格活用",
        detail: "「す」「おはす」など",
        verbs: [getRepresentativeVerb("サ行変格活用")].filter(Boolean) as VerbTypeEntry[],
      },
      {
        name: "ナ行変格活用",
        detail: "「死ぬ」「去（い）ぬ」の2語",
        verbs: [getRepresentativeVerb("ナ行変格活用")].filter(Boolean) as VerbTypeEntry[],
      },
      {
        name: "ラ行変格活用",
        detail: "「あり・をり・はべり・いまそかり」の4語",
        verbs: [getRepresentativeVerb("ラ行変格活用")].filter(Boolean) as VerbTypeEntry[],
      },
    ],
  },
];

export function OverviewPhase({ onNext }: OverviewPhaseProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-base font-bold text-sumi-dark tracking-wider">
          活用の種類は全部で9種
        </h2>
        <p className="text-xs text-muted mt-1">
          少数派と変格は丸暗記。それ以外はパターンで分かる。
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-sumi-dark">{group.label}</span>
            <span className="text-[10px] text-muted">{group.desc}</span>
          </div>

          {group.types.map((type) => {
            const isExpanded = expandedType === type.name;
            const verb = type.verbs[0];
            return (
              <button
                key={type.name}
                type="button"
                onClick={() => setExpandedType(isExpanded ? null : type.name)}
                className={`w-full text-left border rounded-lg px-3 py-2.5 transition-all ${
                  isExpanded
                    ? "bg-card border-sumi-dark shadow-sm"
                    : "bg-card border-border hover:border-sumi-dark/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-sumi-dark">{type.name}</span>
                  <span className="text-[10px] text-muted">{isExpanded ? "▲" : "▼"}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{type.detail}</p>

                {isExpanded && verb && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="text-xs text-muted mb-1">
                      {verb.representative}（{verb.row}）
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {FORMS.map((form) => (
                        <span
                          key={form}
                          className="border rounded px-2 py-0.5 text-xs"
                          style={{
                            borderColor: FORM_HEX_MAP[form] + "60",
                            color: FORM_HEX_MAP[form],
                            backgroundColor: FORM_HEX_MAP[form] + "10",
                          }}
                        >
                          {verb.stem}{verb.forms[form]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}

      <button
        type="button"
        onClick={onNext}
        className="mt-2 bg-sumi-dark text-washi px-6 py-3 rounded-lg text-sm font-bold tracking-wider w-full"
      >
        暗記ドリルへ →
      </button>
    </div>
  );
}
