import type { LayerId } from "./core.ts";

export interface LayerProgress {
  mastery: number;
  completed: boolean;
  lastAccess?: string;
}

export interface SessionRecord {
  date: string;
  correct: number;
  total: number;
  layer: `layer${LayerId}`;
}

export interface UserProgress {
  lastSession: string;
  streak: number;
  layers: Record<`layer${LayerId}`, LayerProgress>;
  weakItems: string[];
  sessionHistory: SessionRecord[];
}
