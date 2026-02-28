export type LayerId = 0 | 1 | 2 | 3;

export type VerbForm =
  | "未然形"
  | "連用形"
  | "終止形"
  | "連体形"
  | "已然形"
  | "命令形";

export type L0Phase = "intro" | "animation" | "pairs" | "summary";

export type ConjugationType =
  | "四段活用"
  | "上二段活用"
  | "下二段活用"
  | "上一段活用"
  | "下一段活用"
  | "カ行変格活用"
  | "サ行変格活用"
  | "ラ行変格活用"
  | "ナ行変格活用";

export interface LayerDefinition {
  id: LayerId;
  title: string;
  subtitle: string;
  description: string;
  requiredMastery: number;
}
