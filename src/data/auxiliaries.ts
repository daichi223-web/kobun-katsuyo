import type { AuxiliaryVerbData } from "../types/auxiliary.ts";

export const AUXILIARIES: AuxiliaryVerbData[] = [
  // ─────────────────────────────────────────
  // Group A: 基本
  // ─────────────────────────────────────────
  {
    id: "zu",
    word: "ず",
    group: "A",
    connection: "未然形",
    conjugationType: "特殊型",
    meanings: ["打消"],
  },
  {
    id: "ki",
    word: "き",
    group: "A",
    connection: "連用形",
    conjugationType: "特殊型",
    meanings: ["過去（体験過去）"],
  },
  {
    id: "keri",
    word: "けり",
    group: "A",
    connection: "連用形",
    conjugationType: "ラ変型",
    meanings: ["過去（伝聞）", "詠嘆"],
  },

  // ─────────────────────────────────────────
  // Group B: 完了系
  // ─────────────────────────────────────────
  {
    id: "tsu",
    word: "つ",
    group: "B",
    connection: "連用形",
    conjugationType: "下二段型",
    meanings: ["完了", "強意"],
  },
  {
    id: "nu",
    word: "ぬ",
    group: "B",
    connection: "連用形",
    conjugationType: "ナ変型",
    meanings: ["完了", "強意"],
  },
  {
    id: "tari",
    word: "たり",
    group: "B",
    connection: "連用形",
    conjugationType: "ラ変型",
    meanings: ["完了", "存続"],
  },
  {
    id: "ri",
    word: "り",
    group: "B",
    connection: "サ変未然形・四段已然形",
    conjugationType: "ラ変型",
    meanings: ["完了", "存続"],
  },

  // ─────────────────────────────────────────
  // Group C: 推量系
  // ─────────────────────────────────────────
  {
    id: "mu",
    word: "む",
    group: "C",
    connection: "未然形",
    conjugationType: "四段型",
    meanings: ["推量", "意志", "勧誘", "適当", "仮定", "婉曲"],
    disambiguationFlow: [
      {
        step: 1,
        question: "主語の人称は？",
        options: [
          { choice: "一人称", result: "意志" },
          { choice: "二人称", result: "勧誘・適当" },
          { choice: "三人称", next: 2 },
        ],
      },
      {
        step: 2,
        question: "文中の位置は？",
        options: [
          { choice: "連体形（名詞修飾）", result: "婉曲・仮定" },
          { choice: "文末", result: "推量" },
        ],
      },
    ],
  },
  {
    id: "beshi",
    word: "べし",
    group: "C",
    connection: "終止形（ラ変は連体形）",
    conjugationType: "形容詞型",
    meanings: ["推量", "意志", "当然", "適当", "可能", "命令"],
  },
  {
    id: "mashi",
    word: "まし",
    group: "C",
    connection: "未然形",
    conjugationType: "特殊型",
    meanings: ["反実仮想", "ためらいの意志"],
  },
  {
    id: "ji",
    word: "じ",
    group: "C",
    connection: "未然形",
    conjugationType: "特殊型",
    meanings: ["打消推量", "打消意志"],
  },
  {
    id: "ramu",
    word: "らむ",
    group: "C",
    connection: "終止形（ラ変は連体形）",
    conjugationType: "四段型",
    meanings: ["現在推量", "原因推量", "婉曲"],
  },
  {
    id: "kemu",
    word: "けむ",
    group: "C",
    connection: "連用形",
    conjugationType: "四段型",
    meanings: ["過去推量", "原因推量", "婉曲"],
  },

  // ─────────────────────────────────────────
  // Group D: 受身・使役・その他
  // ─────────────────────────────────────────
  {
    id: "ru",
    word: "る",
    group: "D",
    connection: "四段・ナ変・ラ変の未然形",
    conjugationType: "下二段型",
    meanings: ["受身", "尊敬", "自発", "可能"],
  },
  {
    id: "raru",
    word: "らる",
    group: "D",
    connection: "上記以外の未然形",
    conjugationType: "下二段型",
    meanings: ["受身", "尊敬", "自発", "可能"],
  },
  {
    id: "su",
    word: "す",
    group: "D",
    connection: "四段・ナ変・ラ変の未然形",
    conjugationType: "下二段型",
    meanings: ["使役", "尊敬"],
  },
  {
    id: "sasu",
    word: "さす",
    group: "D",
    connection: "上記以外の未然形",
    conjugationType: "下二段型",
    meanings: ["使役", "尊敬"],
  },
  {
    id: "nari-dantei",
    word: "なり（断定）",
    group: "D",
    connection: "体言・連体形",
    conjugationType: "ナリ活用型",
    meanings: ["断定", "存在"],
  },
  {
    id: "nari-suitei",
    word: "なり（推定）",
    group: "D",
    connection: "終止形（ラ変は連体形）",
    conjugationType: "ラ変型",
    meanings: ["伝聞", "推定"],
    disambiguationFlow: [
      {
        step: 1,
        question: "直前の語の活用形は？",
        options: [
          { choice: "終止形", result: "推定の「なり」" },
          { choice: "連体形・体言", result: "断定の「なり」" },
        ],
      },
    ],
  },
  {
    id: "mahoshi",
    word: "まほし",
    group: "D",
    connection: "未然形",
    conjugationType: "形容詞シク活用型",
    meanings: ["希望"],
  },
  {
    id: "tashi",
    word: "たし",
    group: "D",
    connection: "連用形",
    conjugationType: "形容詞ク活用型",
    meanings: ["希望"],
  },
];
