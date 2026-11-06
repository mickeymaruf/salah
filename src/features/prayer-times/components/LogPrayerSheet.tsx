import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheet, Text } from '@/shared/ui';
import { colors, radii, sizes } from '@/shared/theme';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { PRAYER_LABELS, type PrayerName } from '../calculate';
import { availableChoices, canClear, type LogChoice, type LogStatus } from '../logChoice';

interface LogPrayerSheetProps {
  prayer: PrayerName;
  subtitle: string;
  status: LogStatus;
  initial: LogChoice | null;
  onSave: (choice: LogChoice) => void;
  // Returns the prayer to unmarked. Offered only when there is a choice to clear.
  onClear: () => void;
  onClose: () => void;
}

const PRAYER_PICTURES: Record<PrayerName, number> = {
  fajr: require('../../../../assets/images/sheet-fajr.png'),
  dhuhr: require('../../../../assets/images/sheet-dhuhr.png'),
  asr: require('../../../../assets/images/sheet-asr.png'),
  maghrib: require('../../../../assets/images/sheet-maghrib.png'),
  isha: require('../../../../assets/images/sheet-isha.png'),
};

const CHOICE_PICTURES: Record<LogChoice, number> = {
  prayed: require('../../../../assets/images/sheet-tick.png'),
  missed: require('../../../../assets/images/sheet-cross.png'),
};

const CHOICES: readonly LogChoice[] = ['prayed', 'missed'];
const TITLES: Record<LogChoice, string> = { prayed: 'Prayed', missed: 'Missed' };
const FILLS: Record<LogChoice, string> = { prayed: colors.bg.sage, missed: colors.choiceMissed };
const RINGS: Record<LogChoice, string> = { prayed: colors.brand.green, missed: colors.state.missed };

const CLOSE_DELAY_MS = 600;
const PRESS_MS = 80;
const PRESS_SCALE = 0.97;
const TINT_MS = 150;
const DIMMED = 0.55;
const SPRING_FROM = 0.9;
const SPRING_PEAK = 1.15;

// Mount it to open, unmount it to close. Tapping Prayed or Missed selects it, plays a short animation and, after 600 ms, writes it to the log and closes the sheet.
// Tapping the selected card again before that cancels both. A dismissal (scrim or back) while a choice is waiting writes it too.
export function LogPrayerSheet(props: LogPrayerSheetProps) {
  return (
    <BottomSheet onClose={props.onClose} bottomGap={6}>
      {(close) => <SheetBody {...props} close={close} />}
    </BottomSheet>
  );
}

function SheetBody({ prayer, subtitle, status, initial, onSave, onClear, close }: LogPrayerSheetProps & { close: () => void }) {
  const allowed = availableChoices(status);
  const reduceMotion = useReduceMotion();
  const [choice, setChoice] = useState<LogChoice | null>(initial);
  const [selected] = useState(() => ({
    prayed: new Animated.Value(initial === 'prayed' ? 1 : 0),
    missed: new Animated.Value(initial === 'missed' ? 1 : 0),
  }));
  const [iconScale] = useState(() => ({ prayed: new Animated.Value(1), missed: new Animated.Value(1) }));
  const [pressScale] = useState(() => ({ prayed: new Animated.Value(1), missed: new Animated.Value(1) }));

  // What is waiting to be written and the timer that will write it. The refs hold the latest callbacks so the timer and the unmount can use them.
  const pending = useRef<LogChoice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ onSave, status, close });
  useEffect(() => {
    latest.current = { onSave, status, close };
  }, [onSave, status, close]);

  // Nothing is written twice: the choice is cleared from `pending` as it is written.
  const commit = useCallback(() => {
    const next = pending.current;
    pending.current = null;
    if (next && next !== latest.current.status) latest.current.onSave(next);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      commit();
    },
    [commit],
  );

  // The tint and ring fade in on the chosen card and out on the other.
  useEffect(() => {
    for (const kind of CHOICES) {
      Animated.timing(selected[kind], { toValue: choice === kind ? 1 : 0, duration: TINT_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }
  }, [choice, selected]);

  const select = (kind: LogChoice) => {
    if (!allowed.includes(kind)) return;
    if (timer.current) clearTimeout(timer.current);
    if (pending.current === kind) {
      pending.current = null;
      timer.current = null;
      setChoice(initial);
      return;
    }
    pending.current = kind;
    setChoice(kind);
    if (!reduceMotion) {
      iconScale[kind].setValue(SPRING_FROM);
      Animated.sequence([
        Animated.timing(iconScale[kind], { toValue: SPRING_PEAK, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(iconScale[kind], { toValue: 1, damping: 9, stiffness: 180, mass: 0.6, useNativeDriver: true }),
      ]).start();
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      commit();
      latest.current.close();
    }, CLOSE_DELAY_MS);
  };

  const press = (kind: LogChoice, down: boolean) => {
    if (down) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (reduceMotion) return;
    Animated.timing(pressScale[kind], { toValue: down ? PRESS_SCALE : 1, duration: PRESS_MS, useNativeDriver: true }).start();
  };

  return (
    <>
      <View style={styles.header}>
        <Image source={PRAYER_PICTURES[prayer]} style={styles.prayerPicture} accessibilityIgnoresInvertColors />
        <View style={styles.headerText}>
          <Text variant="logName" accessibilityRole="header">
            {PRAYER_LABELS[prayer]}
          </Text>
          <Text variant="logSubtitle" color="muted">
            {subtitle}
          </Text>
        </View>
      </View>
      <Text variant="logPrompt" style={styles.question}>
        Did you pray?
      </Text>
      <View style={styles.options}>
        {CHOICES.map((kind) => {
          const other = CHOICES.find((candidate) => candidate !== kind) ?? kind;
          const enabled = allowed.includes(kind);
          // The other card eases down to 55% once this one is chosen.
          const opacity = selected[other].interpolate({ inputRange: [0, 1], outputRange: [enabled ? 1 : 0.45, DIMMED] });
          return (
            <Animated.View key={kind} style={[styles.slot, { opacity, transform: [{ scale: pressScale[kind] }] }]}>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={TITLES[kind]}
                accessibilityState={{ selected: choice === kind, disabled: !enabled }}
                disabled={!enabled}
                onPressIn={() => press(kind, true)}
                onPressOut={() => press(kind, false)}
                onPress={() => select(kind)}
                style={styles.card}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[styles.tint, { opacity: selected[kind], backgroundColor: FILLS[kind], borderColor: RINGS[kind] }]}
                />
                <Animated.Image
                  source={CHOICE_PICTURES[kind]}
                  style={[styles.choicePicture, { transform: [{ scale: iconScale[kind] }] }]}
                  accessibilityIgnoresInvertColors
                />
                <Text variant="bodyStrong">{TITLES[kind]}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {canClear(status) ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (timer.current) clearTimeout(timer.current);
            pending.current = null;
            onClear();
            close();
          }}
          style={styles.clear}
        >
          <Text variant="label" color="muted">
            Clear mark
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  prayerPicture: { width: 56, height: 56, borderRadius: 28 },
  headerText: { gap: 2 },
  question: { marginTop: 20 },
  options: { marginTop: 12, flexDirection: 'row', gap: 12 },
  slot: { flex: 1 },
  card: {
    height: 150,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.viewfinder,
    borderWidth: 1.5,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.surface,
  },
  // Covers the card's own border with the chosen fill and a 2 px ring, and carries the shadow (y 6, blur 14, 8% black).
  tint: {
    position: 'absolute',
    top: -1.5,
    left: -1.5,
    right: -1.5,
    bottom: -1.5,
    borderRadius: radii.viewfinder,
    borderWidth: 2,
    shadowColor: colors.ink.primary,
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  choicePicture: { width: 76, height: 76, borderRadius: 38 },
  clear: { minHeight: sizes.iconButton, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
