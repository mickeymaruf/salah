import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSaveChoice } from '@/features/prayer-times/data/useSaveChoice';
import type { LogChoice } from '@/features/prayer-times/logChoice';
import type { CatchUpItem } from './queue';
import { useReduceMotion } from './useReduceMotion';

const GROW_MS = 350;
const CONTENT_MS = 150;
const HOLD_MS = 400;
const FADE_MS = 250;
const REDUCED_MS = 150;

export interface Result {
  choice: LogChoice;
  item: CatchUpItem;
}

// One answer at a time: save it, grow its colour over the screen, hold, then move on to the next prayer.
// With reduce motion on, the colour fades in and out instead of growing.
export function useAnswerFlow(items: CatchUpItem[]) {
  const saveChoice = useSaveChoice();
  const reduceMotion = useReduceMotion();
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState({ prayed: 0, missed: 0 });
  const [result, setResult] = useState<Result | null>(null);

  // Question screen: 0 at rest, 1 when the other shape has shrunk away.
  const [grow] = useState(() => new Animated.Value(0));
  // Full-colour screen: the chosen shape growing, its content fading in, and the whole layer's opacity.
  const [fill] = useState(() => new Animated.Value(0));
  const [overlay] = useState(() => new Animated.Value(0));
  const [content] = useState(() => new Animated.Value(0));
  // How far the prayer name has been dragged sideways.
  const [dragX] = useState(() => new Animated.Value(0));

  const busy = useRef(false);
  const mounted = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const done = index >= items.length;
  const item = done ? null : items[index];

  const advance = () => {
    if (!mounted.current) return;
    setIndex((value) => value + 1);
    grow.setValue(0);
    dragX.setValue(0);
    Animated.timing(overlay, {
      toValue: 0,
      duration: reduceMotion ? REDUCED_MS : FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      if (!mounted.current) return;
      setResult(null);
      fill.setValue(0);
      content.setValue(0);
      busy.current = false;
    });
  };

  const answer = (choice: LogChoice) => {
    if (!item || busy.current) return;
    busy.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    saveChoice(item.date, item.prayer, choice);
    setResult({ choice, item });
    setCounts((value) => ({ ...value, [choice]: value[choice] + 1 }));

    const hold = ({ finished }: { finished: boolean }) => {
      if (finished) timers.current.push(setTimeout(advance, HOLD_MS));
    };
    if (reduceMotion) {
      Animated.parallel([
        Animated.timing(overlay, { toValue: 1, duration: REDUCED_MS, useNativeDriver: true }),
        Animated.timing(content, { toValue: 1, duration: REDUCED_MS, useNativeDriver: true }),
      ]).start(hold);
      return;
    }
    overlay.setValue(1);
    const ease = { duration: GROW_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true };
    Animated.sequence([
      Animated.parallel([Animated.timing(grow, { toValue: 1, ...ease }), Animated.timing(fill, { toValue: 1, ...ease })]),
      Animated.timing(content, { toValue: 1, duration: CONTENT_MS, useNativeDriver: true }),
    ]).start(hold);
  };

  return { index, done, item, counts, result, reduceMotion, answer, grow, fill, overlay, content, dragX };
}
