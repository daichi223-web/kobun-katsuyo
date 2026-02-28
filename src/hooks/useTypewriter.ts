import { useEffect, useRef, useSyncExternalStore } from "react";

export function useTypewriter(text: string, speed = 60, active = true) {
  const charRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subscribe = (listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  };

  const getSnapshot = () => charRef.current;

  const charIndex = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!active) return;

    charRef.current = 0;
    listenersRef.current.forEach((l) => l());

    intervalRef.current = setInterval(() => {
      if (charRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      charRef.current += 1;
      listenersRef.current.forEach((l) => l());
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, active]);

  const done = charIndex >= text.length;
  return { displayText: text.slice(0, charIndex), done };
}
