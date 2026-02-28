export interface Morpheme {
  surface: string;
  pos: string;
  note?: string;
  meaning?: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface SentenceData {
  id: string;
  text: string;
  source: string;
  difficulty: Difficulty;
  auxiliaries: string[];
  features: string[];
  morphemes: Morpheme[];
  translations: string[];
}
