import type { LayerId } from "../types/core.ts";
import type { UserProgress } from "../types/progress.ts";
import { MASTERY_THRESHOLD } from "../data/constants.ts";

export function isLayerUnlocked(
  layerId: LayerId,
  progress: UserProgress | null,
): boolean {
  if (layerId === 0) return true;
  if (!progress) return false;

  const prevKey = `layer${(layerId - 1) as LayerId}` as const;
  const prev = progress.layers[prevKey];
  return prev.mastery >= MASTERY_THRESHOLD;
}

export function computeLayerMastery(
  correct: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getMasteryLabel(mastery: number): string {
  if (mastery === 0) return "未着手";
  if (mastery < 60) return "学習中";
  if (mastery < 80) return "定着中";
  return "習熟";
}

export function getMasteryColor(mastery: number): string {
  if (mastery === 0) return "var(--color-form-shushi)";
  if (mastery < 60) return "var(--color-form-mizen)";
  if (mastery < 80) return "var(--color-form-izen)";
  return "var(--color-correct)";
}
