import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors, sizes, spacing } from '@/shared/theme';
import { todayKey } from '@/shared/lib/date';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { RollingCount } from './components/RollingCount';
import { findDhikr, type DhikrEntry } from './config';
import { registerTap, type CounterState } from './counter';
import { getDhikrDay, setDhikrCount } from './data/dhikrLog';
import { countForKey } from './deeds';

// Writes are batched: a tap changes the screen at once and the database about this long after the last tap.
export const SAVE_DELAY_MS = 500;
const HINT_REST_OPACITY = 0.7;

export function DhikrCounterScreen() {
  const { key } = useLocalSearchParams<{ key?: string }>();
  const entry = findDhikr(key);
  if (!entry) return <Redirect href="/dhikr" />;
  return <Counter entry={entry} />;
}

function Counter({ entry }: { entry: DhikrEntry }) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const state = useRef<CounterState>({ day: todayKey(), count: 0 });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);
  const [hint] = useState(() => new Animated.Value(HINT_REST_OPACITY));
  const hintShown = useRef(true);
  const [count, setCount] = useState(0);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current) return;
    dirty.current = false;
    const { day, count: value } = state.current;
    setDhikrCount(entry.key, day, value).catch(() => {
      dirty.current = true;
    });
  }, [entry.key]);

  useEffect(() => {
    let active = true;
    const today = todayKey();
    getDhikrDay(today)
      .then((rows) => {
        if (!active) return;
        state.current = { day: today, count: countForKey(rows, entry.key, today) };
        loaded.current = true;
        setCount(state.current.count);
      })
      .catch(() => {
        loaded.current = true;
      });
    return () => {
      active = false;
    };
  }, [entry.key]);

  // Saved when the screen closes and when the app goes to the background, so no tap is lost.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') flush();
    });
    return () => {
      sub.remove();
      flush();
    };
  }, [flush]);

  const tap = () => {
    if (!loaded.current) return;
    const { next, closed } = registerTap(state.current, todayKey());
    if (closed) setDhikrCount(entry.key, closed.day, closed.count).catch(() => undefined);
    state.current = next;
    dirty.current = true;
    setCount(next.count);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY_MS);
    if (hintShown.current) {
      hintShown.current = false;
      Animated.timing(hint, { toValue: 0, duration: reduceMotion ? 0 : 200, useNativeDriver: true }).start();
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, ${entry.meaning}. Count ${count}. Tap anywhere to add one.`}
      onPress={tap}
      style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
    >
      <StatusBar style="dark" />
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
        <X size={24} color={colors.ink.primary} strokeWidth={1.5} />
      </Pressable>
      <Text variant="arabicHero" style={styles.arabic} accessibilityElementsHidden importantForAccessibility="no">
        {entry.arabic}
      </Text>
      <Text variant="counterName" style={styles.name}>
        {entry.name}
      </Text>
      <Text variant="pillTime" color="muted" style={styles.meaning}>
        {entry.meaning}
      </Text>
      <View style={styles.count} accessibilityLiveRegion="polite">
        <RollingCount value={count} reduceMotion={reduceMotion} />
      </View>
      <View style={styles.fill} />
      <Animated.View style={{ opacity: hint }}>
        <Text variant="caption" color="muted" style={styles.hint}>
          Tap anywhere
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base, paddingHorizontal: spacing.screenX, alignItems: 'center' },
  fill: { flex: 1 },
  close: { alignSelf: 'flex-start', width: sizes.iconButton, height: sizes.iconButton, marginTop: 20, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  arabic: { marginTop: 29, textAlign: 'center' },
  name: { marginTop: 43, textAlign: 'center' },
  meaning: { marginTop: 7, textAlign: 'center' },
  count: { marginTop: 69, alignSelf: 'stretch' },
  hint: { textAlign: 'center' },
});
