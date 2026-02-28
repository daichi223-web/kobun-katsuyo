import type { FormPair } from "../types/verb.ts";

export const FORM_PAIRS: FormPair[] = [
  {
    left: { form: "未然形", desc: "まだそうでない", example: "書か（ず）" },
    right: { form: "已然形", desc: "すでにそうだ", example: "書け（ば）" },
    contrast: "「ば」をつけると意味が逆になる",
    leftResult: "仮定「もし書くならば」",
    rightResult: "確定「書くので・書くと」",
  },
  {
    left: { form: "連用形", desc: "用言につながる・中止", example: "書き（けり）" },
    right: { form: "連体形", desc: "体言につながる", example: "書く（人）" },
    contrast: "つながる先が違う",
    leftResult: "動詞・助動詞へ",
    rightResult: "名詞・体言へ",
  },
];
