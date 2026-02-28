import { useMemo } from "react";
import type { LayerId } from "../types/core.ts";
import type { UserProgress } from "../types/progress.ts";
import { isLayerUnlocked } from "../engine/mastery.ts";

export function useLayerUnlock(progress: UserProgress | null) {
  return useMemo(() => {
    const unlocked: Record<LayerId, boolean> = {
      0: true,
      1: false,
      2: false,
      3: false,
      4: false,
    };

    if (progress) {
      for (const id of [1, 2, 3, 4] as LayerId[]) {
        unlocked[id] = isLayerUnlocked(id, progress);
      }
    }

    return unlocked;
  }, [progress]);
}
