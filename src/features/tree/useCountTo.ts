import { useEffect, useRef, useState } from 'react';
import { COUNT_MS } from './transition';

// A number that counts to `target` in 400 ms (ease-out) when `animate` is on, and jumps to it otherwise.
export function useCountTo(target: number, animate: boolean, durationMs: number = COUNT_MS): number {
  const [display, setDisplay] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (!animate || current.current === target) {
      current.current = target;
      setDisplay(target);
      return;
    }
    const from = current.current;
    let frame = 0;
    let start: number | null = null;
    const step = (time: number) => {
      start ??= time;
      const t = Math.min(1, (time - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      current.current = from + (target - from) * eased;
      setDisplay(current.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, animate, durationMs]);

  return display;
}
