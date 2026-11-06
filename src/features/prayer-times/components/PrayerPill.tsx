import { memo, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/shared/ui';
import type { ViewHandle } from '@/shared/feedback';
import { colors } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { PRAYER_LABELS, type PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import { buttonCentreX, coverRadius } from '../markGeometry';
import type { PrayerState } from '../schedule';
import { ChoiceButton } from './ChoiceButton';
import { PrayerParticles } from './PrayerParticles';

export const PILL_HEIGHT = 64;
const HEIGHT = PILL_HEIGHT;
const BUTTON = 44;
// Figma: the cross is 17 px from the left edge and the check 11 px from the right edge.
const BUTTON_LEFT = 17;
const BUTTON_RIGHT = 11;
const BUTTON_TOP = (HEIGHT - BUTTON) / 2;
const TEXT_LEFT = 76;
const MARKED_TEXT_LEFT = 24;

// The marking animation. The circle grows 0 to 1 in scale only, never in width, height or radius. The buttons leave
// while it starts, and the text slides left a moment later, so the three overlap.
const COVER_MS = 520;
const COVER_EASING = Easing.bezier(0.45, 0, 0.2, 1);
const LEAVE_MS = 180;
const SLIDE_MS = 320;
const SLIDE_DELAY_MS = 120;
const REDUCED_MS = 150;

interface PrayerPillProps {
  name: PrayerName;
  time: Date;
  index: number;
  state: PrayerState;
  // The prayer in progress gets a warm grey fill.
  isCurrent: boolean;
  onMark: (name: PrayerName, choice: LogChoice) => void;
  // Called as well when it was marked as prayed, with the check button so the celebration can start from it.
  onPrayed: (name: PrayerName, from: ViewHandle | null) => void;
  // Opens the log sheet, for changing or clearing a mark that is already there.
  onEdit: (name: PrayerName) => void;
}

const FILL: Record<LogChoice, string> = { prayed: colors.pill.prayed, missed: colors.pill.missed };

// One prayer. Before it is due the buttons are dimmed and do nothing. One tap on the cross or check marks it and saves at
// once. A circle in the final colour grows from the tapped button over the pill, the buttons shrink away and the text
// slides left. When the circle has covered the pill the pill takes that colour as its own background and the circle goes,
// in the same frame, so the swap cannot be seen. Other pills stay tappable while this one plays.
function PrayerPillView({ name, time, index, state, isCurrent, onMark, onPrayed, onEdit }: PrayerPillProps) {
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(322);
  // The choice being animated. While it is set the pill draws the animation even though the log already has the mark.
  const [tapped, setTapped] = useState<LogChoice | null>(null);
  const [grow] = useState(() => new Animated.Value(0));
  const [leave] = useState(() => new Animated.Value(0));
  const [slide] = useState(() => new Animated.Value(0));
  const prayedButton = useRef<ViewHandle>(null);

  // Once the filled pill is on screen, put the animation back to its start for the next mark.
  useLayoutEffect(() => {
    if (tapped !== null) return;
    grow.setValue(0);
    leave.setValue(0);
    slide.setValue(0);
  }, [tapped, grow, leave, slide]);

  const upcoming = state === 'upcoming';
  const marked = state === 'prayed' || state === 'missed';
  const showMarked = marked && tapped === null;
  const label = PRAYER_LABELS[name];
  const clock = formatTime(time);

  const mark = (choice: LogChoice) => {
    if (tapped !== null || upcoming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setTapped(choice);
    grow.setValue(0);
    leave.setValue(0);
    slide.setValue(0);
    onMark(name, choice);
    if (choice === 'prayed') onPrayed(name, prayedButton.current);
    Animated.parallel([
      Animated.timing(grow, {
        toValue: 1,
        duration: reduceMotion ? REDUCED_MS : COVER_MS,
        easing: reduceMotion ? Easing.linear : COVER_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(leave, {
        toValue: 1,
        duration: reduceMotion ? REDUCED_MS : LEAVE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 1,
        duration: reduceMotion ? 0 : SLIDE_MS,
        delay: reduceMotion ? 0 : SLIDE_DELAY_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      // The values stay at 1 here. Resetting them now would shrink the circle on the native side before React has drawn the
      // filled pill, which shows the old look for a moment. They are reset below, after the pill has been redrawn.
      if (finished) setTapped(null);
    });
  };

  const backgroundColor = showMarked ? FILL[state as LogChoice] : isCurrent ? colors.pill.current : colors.bg.base;
  const textShift = slide.interpolate({ inputRange: [0, 1], outputRange: [0, MARKED_TEXT_LEFT - TEXT_LEFT] });

  // The circle is centred on the tapped button and just reaches the far corner. It only ever changes in scale.
  const cover = (() => {
    if (!tapped) return null;
    const centreX = buttonCentreX(tapped === 'prayed' ? 'right' : 'left', width, tapped === 'prayed' ? BUTTON_RIGHT : BUTTON_LEFT, BUTTON);
    const radius = coverRadius(width, HEIGHT, centreX, HEIGHT / 2);
    const style = reduceMotion
      ? [StyleSheet.absoluteFill, { backgroundColor: FILL[tapped], opacity: grow }]
      : [
          styles.circle,
          {
            left: centreX - radius,
            top: HEIGHT / 2 - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: FILL[tapped],
            transform: [{ scale: grow }],
          },
        ];
    return <Animated.View pointerEvents="none" style={style} />;
  })();

  const content = (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.pill, { backgroundColor }]}
    >
      <PrayerParticles prayer={name} passed={!upcoming} index={index} />
      {cover}
      {showMarked ? null : (
        <>
          <ChoiceButton
            kind="missed"
            leave={tapped ? leave : null}
            dimmed={upcoming}
            disabled={upcoming || tapped !== null}
            label={`Mark ${label} as missed`}
            onPress={() => mark('missed')}
            style={{ left: BUTTON_LEFT, top: BUTTON_TOP }}
          />
          <ChoiceButton
            kind="prayed"
            leave={tapped ? leave : null}
            dimmed={upcoming}
            disabled={upcoming || tapped !== null}
            label={`Mark ${label} as prayed`}
            onPress={() => mark('prayed')}
            style={{ right: BUTTON_RIGHT, top: BUTTON_TOP }}
            slotRef={prayedButton}
          />
        </>
      )}
      <Animated.View
        pointerEvents="none"
        style={[styles.text, { left: showMarked ? MARKED_TEXT_LEFT : TEXT_LEFT }, !showMarked && { transform: [{ translateX: textShift }] }]}
      >
        <Text variant="pillName" color={upcoming ? 'muted' : 'primary'} style={styles.noPadding}>
          {label}
        </Text>
        <Text variant="pillTime" color="muted" style={styles.noPadding}>
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
      onPress={() => onEdit(name)}
    >
      {content}
    </Pressable>
  );
}

export const PrayerPill = memo(PrayerPillView);

const styles = StyleSheet.create({
  pill: { height: HEIGHT, borderRadius: 16, overflow: 'hidden' },
  circle: { position: 'absolute' },
  // Top and bottom at 0 with centred content keeps the name and time in the middle of the pill whatever the font metrics.
  text: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  noPadding: { includeFontPadding: false },
});
