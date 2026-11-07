import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { LEAVES, fallingLeaves, growingLeaves, type Leaf } from './leaves';
import { EMPTY_SNAPSHOT, type TreeSnapshot } from './snapshot';
import { loadSnapshot, saveSnapshot } from './lastSeen';
import {
  FALL_MAX_MS,
  FALL_STAGGER_MS,
  GROW_STAGGER_MS,
  HOLD_MS,
  MAX_RESTING,
  SETTLE_MS,
  overflowResting,
  planFall,
  planGrow,
  planTransition,
  type DropSpec,
} from './transition';
import type { TreeProgress } from './treeProgress';

export type DropPhase = 'falling' | 'landed' | 'fading';

export interface DropItem {
  key: string;
  spec: DropSpec;
  phase: DropPhase;
}

export interface GroupItem {
  key: string;
  leaves: Leaf[];
  delay: number;
  mode: 'in' | 'out';
}

export interface ShownNumbers {
  value: TreeSnapshot;
  // False for the numbers the card starts with: they are shown, not counted to.
  animate: boolean;
}

const FALL_TOTAL_MS = HOLD_MS + FALL_STAGGER_MS + FALL_MAX_MS + SETTLE_MS + 200;
const GROW_TOTAL_MS = GROW_STAGGER_MS + 1000;

function snapshotOf(progress: TreeProgress): TreeSnapshot {
  return { fullness: progress.fullness, perfectDays: progress.perfectDays, streak: progress.streak };
}

interface Input {
  progress: TreeProgress | null;
  focused: boolean;
  reduceMotion: boolean;
}

// Compares the tree now with the tree the user last saw, and plays the right thing: leaves fall, leaves grow, or nothing.
// It runs on every open of the screen and again when a prayer is logged while the screen is open.
export function useTreeAnimation({ progress, focused, reduceMotion }: Input) {
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [staticFullness, setStaticFullness] = useState(0);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [shown, setShown] = useState<ShownNumbers>({ value: EMPTY_SNAPSHOT, animate: false });

  const lastSeen = useRef<TreeSnapshot | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mounted = useRef(true);
  const resting = useRef<string[]>([]);
  const hapticPending = useRef(false);
  const run = useRef(0);

  useEffect(() => {
    mounted.current = true;
    loadSnapshot().then((snapshot) => {
      if (!mounted.current) return;
      lastSeen.current = snapshot;
      setLoaded(true);
    });
    const pending = timers.current;
    return () => {
      mounted.current = false;
      pending.forEach(clearTimeout);
    };
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(
      setTimeout(() => {
        if (mounted.current) fn();
      }, ms),
    );
  }, []);

  const fadeResting = useCallback(() => {
    setDrops((items) => items.map((item) => (item.phase === 'falling' ? item : { ...item, phase: 'fading' })));
    resting.current = [];
  }, []);

  const finish = useCallback((snapshot: TreeSnapshot) => {
    lastSeen.current = snapshot;
    saveSnapshot(snapshot);
    setStaticFullness(snapshot.fullness);
    setHidden(new Set());
    setGroups([]);
    setBusy(false);
  }, []);

  const fullness = progress?.fullness;
  const perfectDays = progress?.perfectDays;
  const streak = progress?.streak;

  useEffect(() => {
    if (!progress || !loaded || !focused || busy) return;
    const last = lastSeen.current;
    const target = snapshotOf(progress);
    const plan = planTransition(last?.fullness ?? null, target.fullness);

    if (plan.kind === 'none' || reduceMotion) {
      setStarted(true);
      setStaticFullness(target.fullness);
      setShown({ value: target, animate: started });
      lastSeen.current = target;
      if (!last || last.perfectDays !== target.perfectDays || last.streak !== target.streak || plan.kind !== 'none') {
        saveSnapshot(target);
      }
      return;
    }

    const id = ++run.current;
    setBusy(true);
    setStarted(true);
    setStaticFullness(plan.from);
    setHidden(new Set());
    setGroups([]);
    setShown({ value: last ?? EMPTY_SNAPSHOT, animate: false });

    if (plan.kind === 'fall') {
      const falling = fallingLeaves(LEAVES, plan.from, plan.to);
      const fallPlan = planFall(falling, Math.random);
      hapticPending.current = (last?.streak ?? 0) > 0 && target.streak === 0;
      later(HOLD_MS, () => {
        setHidden(new Set(falling.map((leaf) => leaf.id)));
        setDrops((items) => [
          ...items,
          ...fallPlan.drops.map((spec): DropItem => ({ key: `${id}-${spec.leaf.id}`, spec, phase: 'falling' })),
        ]);
        setGroups(fallPlan.faded.length ? [{ key: `${id}-faded`, leaves: fallPlan.faded, delay: 0, mode: 'out' }] : []);
        setShown({ value: target, animate: true });
      });
      later(FALL_TOTAL_MS, () => finish(target));
    } else {
      const growing = growingLeaves(LEAVES, plan.from, plan.to);
      later(60, () => {
        setGroups(planGrow(growing).map((group, index) => ({ ...group, key: `${id}-${index}`, mode: 'in' as const })));
        setShown({ value: target, animate: true });
        fadeResting();
      });
      later(GROW_TOTAL_MS, () => finish(target));
    }
    // `progress` is read through its numbers so a new object with the same values does not restart this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullness, perfectDays, streak, loaded, focused, busy, reduceMotion]);

  const onLanded = useCallback((key: string) => {
    if (hapticPending.current) {
      hapticPending.current = false;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    resting.current.push(key);
    const overflow = overflowResting(resting.current, MAX_RESTING);
    resting.current = resting.current.slice(overflow.length);
    setDrops((items) =>
      items.map((item) => {
        if (item.key === key) return { ...item, phase: overflow.includes(key) ? 'fading' : 'landed' };
        return overflow.includes(item.key) ? { ...item, phase: 'fading' } : item;
      }),
    );
  }, []);

  const onGone = useCallback((key: string) => {
    setDrops((items) => items.filter((item) => item.key !== key));
  }, []);

  return { started, staticFullness, hidden, groups, drops, shown, onLanded, onGone };
}
