import type { FormPair } from "../types/verb.ts";

export const FORM_PAIRS: FormPair[] = [
  {
    left: { form: "未然形", desc: "まだそうでない", example: "書か（ば）" },
    right: { form: "已然形", desc: "すでにそうだ", example: "書け（ば）" },
    contrast: "「ば」をつけると意味が逆になる",
    leftResult: "仮定「もし書くならば」",
    rightResult: "確定「書くので・書くと」",
  },
  {
    left: { form: "連用形", desc: "用言（動詞・助動詞）につながる", example: "書き（けり）" },
    right: { form: "連体形", desc: "体言（名詞）につながる", example: "書く（人）" },
    contrast: "後ろに何が来るかで形が決まる — 読解の最重要ポイント",
    leftResult: "後ろに助動詞（けり・たり・ぬ等）が来る → 過去・完了などの意味が加わる。文中の「、」で中止する時もこの形。読解では「連用形＋助動詞」のセットで意味をつかむ",
    rightResult: "後ろに名詞が来て修飾する（書く人＝書く人）。係り結びで「ぞ・なむ・や・か」の結びもこの形。読解では連体形を見たら「何を修飾しているか」「係助詞はないか」を確認する",
  },
];
