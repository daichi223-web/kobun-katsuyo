import type { VerbExample } from "../types/verb.ts";

export const VERB_EXAMPLES: VerbExample[] = [
  {
    base: "書く",
    stem: "書",
    type: "四段活用",
    forms: [
      { ending: "か", form: "未然形", particle: "ず", meaning: "まだそうでない", particleMeaning: "打消" },
      { ending: "き", form: "連用形", particle: "けり", meaning: "動作が起きた後", particleMeaning: "過去" },
      { ending: "く", form: "終止形", particle: "。", meaning: "述べて終わる", particleMeaning: "文末" },
      { ending: "く", form: "連体形", particle: "人", meaning: "名詞につながる", particleMeaning: "体言接続" },
      { ending: "け", form: "已然形", particle: "ば", meaning: "すでにそうだ", particleMeaning: "確定条件" },
      { ending: "け", form: "命令形", particle: "！", meaning: "命令して終える", particleMeaning: "命令" },
    ],
  },
  {
    base: "起く",
    stem: "起",
    type: "上二段活用",
    forms: [
      { ending: "き", form: "未然形", particle: "ず", meaning: "まだそうでない", particleMeaning: "打消" },
      { ending: "き", form: "連用形", particle: "けり", meaning: "動作が起きた後", particleMeaning: "過去" },
      { ending: "く", form: "終止形", particle: "。", meaning: "述べて終わる", particleMeaning: "文末" },
      { ending: "くる", form: "連体形", particle: "人", meaning: "名詞につながる", particleMeaning: "体言接続" },
      { ending: "くれ", form: "已然形", particle: "ば", meaning: "すでにそうだ", particleMeaning: "確定条件" },
      { ending: "きよ", form: "命令形", particle: "！", meaning: "命令して終える", particleMeaning: "命令" },
    ],
  },
  {
    base: "捨つ",
    stem: "捨",
    type: "下二段活用",
    forms: [
      { ending: "て", form: "未然形", particle: "ず", meaning: "まだそうでない", particleMeaning: "打消" },
      { ending: "て", form: "連用形", particle: "けり", meaning: "動作が起きた後", particleMeaning: "過去" },
      { ending: "つ", form: "終止形", particle: "。", meaning: "述べて終わる", particleMeaning: "文末" },
      { ending: "つる", form: "連体形", particle: "人", meaning: "名詞につながる", particleMeaning: "体言接続" },
      { ending: "つれ", form: "已然形", particle: "ば", meaning: "すでにそうだ", particleMeaning: "確定条件" },
      { ending: "てよ", form: "命令形", particle: "！", meaning: "命令して終える", particleMeaning: "命令" },
    ],
  },
];
