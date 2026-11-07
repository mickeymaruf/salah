import { useEffect, useMemo, useState } from 'react';
import { addDays, now, parseDateKey, toDateKey } from '@/shared/lib/date';
import { useNow } from '@/shared/lib/useNow';
import { useProfileStore } from '@/shared/state/profileStore';
import { getDayTimes } from '@/features/prayer-times/calculate';
import { useDayLog } from '@/features/prayer-times/data/useDayLog';
import { useSaveChoice } from '@/features/prayer-times/data/useSaveChoice';
import { useTimesStore } from '@/features/prayer-times/data/useTimesSync';
import { darkPalette, lightPalette } from './palette';
import { loadWidgetBridge, type WidgetBridge } from './widgetBridge';
import { buildWidgetState, nextRefreshAt } from './widgetState';

// Keeps the home screen widget in step with the log. It draws nothing. It redraws the widget on every change to today's log, when the day or the prayer times
// change, at every prayer time and at least once a minute (the countdown). A tap on Missed or Prayed is written to the log here, the same way the Today screen writes it.
export function WidgetSync() {
  const profile = useProfileStore((state) => state.profile);
  const at = useNow(60_000);
  const [bridge, setBridge] = useState<WidgetBridge | null>(null);
  const [tick, setTick] = useState(0);
  const todayKey = toDateKey(at);
  const entries = useDayLog(todayKey);
  const timesRevision = useTimesStore((state) => state.revision);
  const saveChoice = useSaveChoice();

  useEffect(() => {
    let cancelled = false;
    loadWidgetBridge().then((loaded) => {
      if (!cancelled) setBridge(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => {
    if (!profile) return null;
    const current = now();
    const day = parseDateKey(todayKey);
    const today = getDayTimes(profile, day);
    const tomorrow = getDayTimes(profile, addDays(day, 1));
    const outcomes = new Map(entries.map((entry) => [entry.prayer, entry.outcome] as const));
    const state = buildWidgetState({ at: current, today, tomorrow, outcomes });
    return { state, refreshAt: nextRefreshAt(state, today, tomorrow, current) };
    // `tick` and `timesRevision` only force a new read of the clock and of the downloaded times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, todayKey, entries, at, tick, timesRevision]);

  useEffect(() => {
    if (!bridge || !view) return;
    bridge.update({ ...view.state, ...bridge.images, light: lightPalette, dark: darkPalette });
  }, [bridge, view]);

  // A second timer for the exact prayer time, so the widget does not wait for the next minute.
  const refreshAt = view?.refreshAt.getTime();
  useEffect(() => {
    if (refreshAt === undefined) return;
    const timer = setTimeout(() => setTick((count) => count + 1), Math.max(1_000, refreshAt - now().getTime()));
    return () => clearTimeout(timer);
  }, [refreshAt]);

  useEffect(() => {
    if (!bridge) return;
    return bridge.onAnswer((answer) => saveChoice(answer.dayKey, answer.prayer, answer.choice));
  }, [bridge, saveChoice]);

  return null;
}
