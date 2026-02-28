import type { VerbForm } from "../types/core.ts";

export const CORE_SENTENCE =
  "語形が変わるのは、後ろに来る語が要求する形が違うからだ。";

export const MASTERY_THRESHOLD = 80;

export const FORM_COLOR_MAP: Record<VerbForm, string> = {
  未然形: "var(--color-form-mizen)",
  連用形: "var(--color-form-renyou)",
  終止形: "var(--color-form-shushi)",
  連体形: "var(--color-form-rentai)",
  已然形: "var(--color-form-izen)",
  命令形: "var(--color-form-meirei)",
};

export const FORM_HEX_MAP: Record<VerbForm, string> = {
  未然形: "#3b82f6",
  連用形: "#10b981",
  終止形: "#6b7280",
  連体形: "#8b5cf6",
  已然形: "#f59e0b",
  命令形: "#cc3333",
};

export const SIX_FORMS_OVERVIEW = [
  { form: "未然形" as VerbForm, desc: "まだそうでない", acc: "否定・推量・仮定", detail: "「未だ然らず（まだそうなっていない）」。動作や状態が実現する前の段階を表す。「ず（打消）」「む（推量）」「ば（仮定）」などの助動詞・助詞が接続する。", example: "書か＋ず（書かない）" },
  { form: "連用形" as VerbForm, desc: "つながる・中止", acc: "過去・完了・接続", detail: "「用言に連なる」。動詞や助動詞につなぐ形。文の途中で「、」を打って中止するときにもこの形になる。「けり（過去）」「たり（完了）」「て（接続）」などが接続する。", example: "書き＋けり（書いた）" },
  { form: "終止形" as VerbForm, desc: "述べて終わる", acc: "推量・断定系", detail: "文を言い切って終わる形。辞書に載る基本形でもある。「べし（推量・当然）」「なり（伝聞）」「とも（逆接）」などが接続する。", example: "書く。（書く）" },
  { form: "連体形" as VerbForm, desc: "名詞につながる", acc: "名詞修飾・係り結び", detail: "「体言（名詞）に連なる」。名詞を修飾する形。係り結びで「ぞ・なむ・や・か」の結びとしても使われる。", example: "書く＋人（書く人）" },
  { form: "已然形" as VerbForm, desc: "すでにそうだ", acc: "確定条件・こそ", detail: "「已（すで）に然り（そうなった）」。事実として確定している状況を表す。「ば（〜ので／〜すると）」が接続して確定条件を作る。係り結びで「こそ」の結びになる。", example: "書け＋ば（書くので）" },
  { form: "命令形" as VerbForm, desc: "命令して終わる", acc: "助動詞接続なし", detail: "相手に命令して文を終える形。後ろに助動詞は接続しない。この形だけで文が完結する。", example: "書け！（書け）" },
] as const;

export const PHASE_LABELS = ["ポイント", "活用", "対比", "まとめ"] as const;
