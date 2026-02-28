import type { VerbForm, ConjugationType } from "./core.ts";

export interface VerbFormDetail {
  ending: string;
  form: VerbForm;
  particle: string;
  meaning: string;
  particleMeaning: string;
}

export interface VerbExample {
  base: string;
  stem: string;
  type: ConjugationType;
  forms: VerbFormDetail[];
}

export interface FormPairSide {
  form: VerbForm;
  desc: string;
  example: string;
}

export interface FormPair {
  left: FormPairSide;
  right: FormPairSide;
  contrast: string;
  leftResult: string;
  rightResult: string;
}
