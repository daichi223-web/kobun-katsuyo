import { useState, useEffect, useCallback } from "react";
import { get, set } from "idb-keyval";
import type { LayerId } from "../types/core.ts";
import type { UserProgress, LayerProgress } from "../types/progress.ts";

const STORAGE_KEY = "kobun-katsuyo-progress";

function createDefaultProgress(): UserProgress {
  return {
    lastSession: new Date().toISOString(),
    streak: 0,
    layers: {
      layer0: { mastery: 0, completed: false },
      layer1: { mastery: 0, completed: false },
      layer2: { mastery: 0, completed: false },
      layer3: { mastery: 0, completed: false },
      layer4: { mastery: 0, completed: false },
    },
    weakItems: [],
    sessionHistory: [],
  };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<UserProgress>(STORAGE_KEY).then((data) => {
      if (data) {
        const defaults = createDefaultProgress();
        data.layers = { ...defaults.layers, ...data.layers };
        setProgress(data);
      } else {
        setProgress(createDefaultProgress());
      }
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (updated: UserProgress) => {
    updated.lastSession = new Date().toISOString();
    setProgress(updated);
    await set(STORAGE_KEY, updated);
  }, []);

  const updateLayer = useCallback(
    async (layerId: LayerId, patch: Partial<LayerProgress>) => {
      if (!progress) return;
      const key = `layer${layerId}` as const;
      const updated: UserProgress = {
        ...progress,
        layers: {
          ...progress.layers,
          [key]: { ...progress.layers[key], ...patch },
        },
      };
      await save(updated);
    },
    [progress, save],
  );

  const updateStreak = useCallback(async () => {
    if (!progress) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = progress.lastSession.slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    let newStreak = progress.streak;
    if (lastDate === today) {
      // same day, no change
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await save({ ...progress, streak: newStreak });
  }, [progress, save]);

  return { progress, loading, updateLayer, updateStreak, save };
}
