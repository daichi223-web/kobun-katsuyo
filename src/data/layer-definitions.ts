import type { LayerDefinition } from "../types/core.ts";

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    id: 0,
    title: "活用とは",
    subtitle: "ステップ0",
    description: "「なぜ語形が変わるか」を体験的に理解する",
    requiredMastery: 0,
  },
  {
    id: 1,
    title: "活用形の練習",
    subtitle: "ステップ1",
    description: "活用形の名前と形を繰り返し練習する",
    requiredMastery: 80,
  },
  {
    id: 2,
    title: "助動詞の習得",
    subtitle: "ステップ2",
    description: "接続・活用・意味を文脈で運用できる",
    requiredMastery: 80,
  },
  {
    id: 3,
    title: "一文精読",
    subtitle: "ステップ3",
    description: "テキストの前で全処理が自動的に作動する",
    requiredMastery: 80,
  },
];
