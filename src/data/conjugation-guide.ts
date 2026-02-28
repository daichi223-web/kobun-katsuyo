/** 活用の種類ごとの解説データ */
export interface ConjugationGuide {
  name: string;
  shortName: string;
  group: "多数派" | "少数派" | "変格";
  pattern: string;
  howToIdentify: string;
  keyVerbs: string[];
  notes?: string;
}

export const CONJUGATION_GUIDES: ConjugationGuide[] = [
  {
    name: "四段活用",
    shortName: "四段",
    group: "多数派",
    pattern: "a - i - u - u - e - e",
    howToIdentify: "「ず」をつけて未然形がア段なら四段。最も数が多い。",
    keyVerbs: ["書く", "行く", "思ふ", "立つ", "残る", "急ぐ", "出だす"],
    notes: "古文の動詞の大半がここ。母音がア・イ・ウ・エの四段にわたる。",
  },
  {
    name: "上二段活用",
    shortName: "上二段",
    group: "多数派",
    pattern: "i - i - u - uru - ure - iyo",
    howToIdentify: "「ず」をつけて未然形がイ段なら上一段か上二段。終止形が「〜u」なら上二段。",
    keyVerbs: ["起く", "落つ", "過ぐ", "恨む", "老ゆ", "悔ゆ", "報ゆ"],
    notes: "ヤ行上二段（老ゆ・悔ゆ・報ゆ）は特に要暗記。上一段と混同しやすい。",
  },
  {
    name: "下二段活用",
    shortName: "下二段",
    group: "多数派",
    pattern: "e - e - u - uru - ure - eyo",
    howToIdentify: "「ず」をつけて未然形がエ段なら下一段か下二段。終止形が「〜u」なら下二段。",
    keyVerbs: ["捨つ", "受く", "求む", "植う", "据う", "飢う", "得"],
    notes: "ワ行下二段（植う・据う・飢う）と「得（う）」は特に要暗記。下一段（蹴る）と混同注意。",
  },
  {
    name: "上一段活用",
    shortName: "上一段",
    group: "少数派",
    pattern: "i - i - iru - iru - ire - iyo",
    howToIdentify: "終止形が「〜iru」で終わる。該当動詞は「ひいきにみゐる」の6語のみ。",
    keyVerbs: ["干る（ひる）", "射る（いる）", "着る（きる）", "似る（にる）", "見る（みる）", "居る（ゐる）"],
    notes: "「ひいきにみゐる」で丸暗記。鋳る（いる）も上一段。現代語の「見る」「着る」と同じ。",
  },
  {
    name: "下一段活用",
    shortName: "下一段",
    group: "少数派",
    pattern: "e - e - eru - eru - ere - eyo",
    howToIdentify: "古文では「蹴る」の1語だけ。",
    keyVerbs: ["蹴る（ける）"],
    notes: "たった1語。現代語では下一段が大量にあるが、古文ではこれだけ。",
  },
  {
    name: "カ行変格活用",
    shortName: "カ変",
    group: "変格",
    pattern: "こ - き - く - くる - くれ - こ/こよ",
    howToIdentify: "「来（く）」の1語だけ。",
    keyVerbs: ["来（く）"],
    notes: "語幹がなく、全て活用語尾。読みが形ごとに変わる（こ・き・く・くる・くれ・こ）。",
  },
  {
    name: "サ行変格活用",
    shortName: "サ変",
    group: "変格",
    pattern: "せ - し - す - する - すれ - せよ",
    howToIdentify: "「す」「おはす」など。",
    keyVerbs: ["す", "おはす"],
    notes: "「す」は現代語の「する」に対応。複合動詞（〜す）も多い。",
  },
  {
    name: "ナ行変格活用",
    shortName: "ナ変",
    group: "変格",
    pattern: "な - に - ぬ - ぬる - ぬれ - ね",
    howToIdentify: "「死ぬ」「去（い）ぬ」の2語。",
    keyVerbs: ["死ぬ", "去ぬ（いぬ）"],
    notes: "完了の助動詞「ぬ」と混同しやすいので注意。",
  },
  {
    name: "ラ行変格活用",
    shortName: "ラ変",
    group: "変格",
    pattern: "ら - り - り - る - れ - れ",
    howToIdentify: "「あり・をり・はべり・いまそかり」の4語。終止形が「り」で終わる。",
    keyVerbs: ["あり", "をり", "はべり", "いまそかり"],
    notes: "終止形と連用形が同じ「り」。はべり＝丁寧語、いまそかり＝尊敬語。",
  },
];
