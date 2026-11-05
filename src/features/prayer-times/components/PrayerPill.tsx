import { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { PRAYER_LABELS, type PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import type { PrayerState } from '../schedule';
import { ChoiceButton, type ButtonRole } from './ChoiceButton';
import { PrayerParticles } from './PrayerParticles';

const HEIGHT = 60;
const BUTTON = 44;
const BUTTON_INSET = 10;
const TEXT_LEFT = 64;
const MARKED_TEXT_LEFT = 20;
// The covering circle is big enough to reach the far corner of the pill from either button.
const CIRCLE = 700;
const START_SCALE = 0.2;
const MARK_MS = 350;
const REDUCED_MS = 150;

interface PrayerPillProps {
  name: PrayerName;
  time: Date;
  index: number;
  state: PrayerState;
  // The prayer in progress gets a warm grey fill.
  isCurrent: boolean;
  onMark: (choice: LogChoice) => void;
  // Opens the log sheet, for changing or clearing a mark that is already there.
  onEdit: () => void;
}

const FILL: Record<LogChoice, string> = { prayed: colors.pill.prayed, missed: colors.pill.missed };

// One prayer. Before it is due the buttons are dimmed and do nothing. One tap on the cross or check marks it: that button turns
// solid, a circle grows from it over the pill, the other button fades, and the pill ends fully coloured with no buttons.
export function PrayerPill({ name, time, index, state, isCurrent, onMark, onEdit }: PrayerPillProps) {
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(358);
  // The choice being animated. While it is set the pill draws the animation even though the log already has the mark.
  const [tapped, setTapped] = useState<LogChoice | null>(null);
  const [progress] = useState(() => new Animated.Value(0));

  const upcoming = state === 'upcoming';
  const marked = state === 'prayed' || state === 'missed';
  const showMarked = marked && tapped === null;
  const label = PRAYER_LABELS[name];
  const clock = formatTime(time);

  const mark = (choice: LogChoice) => {
    if (tapped !== null || upcoming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setTapped(choice);
    progress.setValue(0);
    onMark(choice);
    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? REDUCED_MS : MARK_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      progress.setValue(0);
      setTapped(null);
    });
  };

  const roleOf = (kind: LogChoice): ButtonRole => (tapped === null ? 'idle' : tapped === kind ? 'tapped' : 'other');
  const backgroundColor = showMarked ? FILL[state as LogChoice] : isCurrent ? colors.pill.current : colors.bg.base;
  const circleColor = tapped ? FILL[tapped] : colors.bg.base;
  // The circle grows from the middle of the tapped button: a check on the right, a cross on the left.
  const centreX = tapped === 'prayed' ? width - BUTTON_INSET - BUTTON / 2 : BUTTON_INSET + BUTTON / 2;
  const circleStyle = reduceMotion
    ? { opacity: progress }
    : { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [START_SCALE, 1] }) }] };
  const textShift = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, MARKED_TEXT_LEFT - TEXT_LEFT],
  });

  const content = (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.pill, { backgroundColor }]}
    >
      <PrayerParticles prayer={name} passed={!upcoming} index={index} />
      {tapped ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.circle, { left: centreX - CIRCLE / 2, top: HEIGHT / 2 - CIRCLE / 2, backgroundColor: circleColor }, circleStyle]}
        />
      ) : null}
      {showMarked ? null : (
        <>
          <ChoiceButton
            kind="missed"
            role={roleOf('missed')}
            progress={progress}
            dimmed={upcoming}
            disabled={upcoming || tapped !== null}
            label={`Mark ${label} as missed`}
            onPress={() => mark('missed')}
            style={{ left: BUTTON_INSET }}
          />
          <ChoiceButton
            kind="prayed"
            role={roleOf('prayed')}
            progress={progress}
            dimmed={upcoming}
            disabled={upcoming || tapped !== null}
            label={`Mark ${label} as prayed`}
            onPress={() => mark('prayed')}
            style={{ right: BUTTON_INSET }}
          />
        </>
      )}
      <Animated.View
        pointerEvents="none"
        style={[styles.text, { left: showMarked ? MARKED_TEXT_LEFT : TEXT_LEFT }, !showMarked && { transform: [{ translateX: textShift }] }]}
      >
        <Text variant="rowStrong" color={upcoming ? 'muted' : 'primary'}>
          {label}
        </Text>
        <Text variant="caption" color="muted">
          {clock}
        </Text>
      </Animated.View>
    </View>
  );

  if (!showMarked) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${clock}, ${state}`}
      accessibilityHint="Opens a sheet to change or clear the mark"
      onPress={onEdit}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { height: HEIGHT, borderRadius: 16, overflow: 'hidden' },
  circle: { position: 'absolute', width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 },
  text: { position: 'absolute', top: 12, gap: 2 },
});
