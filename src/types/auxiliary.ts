import type { VerbForm } from "./core.ts";

export type AuxiliaryGroup = "A" | "B" | "C" | "D";

export interface DisambiguationOption {
  choice: string;
  result?: string;
  next?: number;
}

export interface DisambiguationStep {
  step: number;
  question: string;
  options: DisambiguationOption[];
}

export interface AuxiliaryVerbData {
  id: string;
  word: string;
  group: AuxiliaryGroup;
  connection: VerbForm | string;
  conjugationType: string;
  meanings: string[];
  disambiguationFlow?: DisambiguationStep[];
}
