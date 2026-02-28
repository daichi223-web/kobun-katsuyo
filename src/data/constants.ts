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
  { form: "未然形" as VerbForm, desc: "まだそうでない", acc: "否定・推量・仮定" },
  { form: "連用形" as VerbForm, desc: "つながる・中止", acc: "過去・完了・接続" },
  { form: "終止形" as VerbForm, desc: "述べて終わる", acc: "推量・断定系" },
  { form: "連体形" as VerbForm, desc: "名詞につながる", acc: "名詞修飾・係り結び" },
  { form: "已然形" as VerbForm, desc: "すでにそうだ", acc: "確定条件・こそ" },
  { form: "命令形" as VerbForm, desc: "命令して終わる", acc: "助動詞接続なし" },
] as const;

export const PHASE_LABELS = ["核心", "変化", "対比", "まとめ"] as const;
