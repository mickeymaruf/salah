import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS } from '@/features/prayer-times/calculate';
import type { LogChoice } from '@/features/prayer-times/logChoice';
import { AllCaughtUp } from './components/AllCaughtUp';
import { HalfEllipse } from './components/HalfEllipse';
import { ResultContent } from './components/ResultContent';
import { useCatchUpStore } from './catchUpStore';
import { anchorShift, coverScale, insideHalfEllipse, type Side } from './geometry';
import type { CatchUpItem } from './queue';
import { useAnswerFlow } from './useAnswerFlow';

// A drag past a quarter of the screen width, or a quick flick, answers.
const SWIPE_FRACTION = 0.25;
const FLICK_SPEED = 0.9;
const MAX_TILT_DEG = 8;

const SIDE_FOR: Record<LogChoice, Side> = { missed: 'left', prayed: 'right' };
const FILL_COLOR: Record<LogChoice, string> = { missed: colors.state.missedSoft, prayed: colors.bg.sage };

export function CatchUpScreen() {
  // The queue is copied once, so clearing the store on the way out cannot empty the screen while it fades.
  const [items] = useState(() => useCatchUpStore.getState().queue);
  useEffect(() => () => useCatchUpStore.getState().clear(), []);
  if (items.length === 0) return <Redirect href="/today" />;
  return <Prompt items={items} />;
}

function Prompt({ items }: { items: CatchUpItem[] }) {
  const { index, done, item, counts, result, reduceMotion, answer, grow, fill, overlay, content, dragX } = useAnswerFlow(items);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [headerBottom, setHeaderBottom] = useState(0);

  // Dragging the prayer name sideways answers: right is Yes, left is No. Rebuilt only when what it reads changes.
  const locked = result !== null;
  const pan = useMemo(() => {
    const springBack = () => Animated.spring(dragX, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, { dx, dy }) => !locked && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy),
      onPanResponderMove: Animated.event([null, { dx: dragX }], { useNativeDriver: false }),
      onPanResponderRelease: (_event, { dx, vx }) => {
        const threshold = size.width * SWIPE_FRACTION;
        if (dx > threshold || vx > FLICK_SPEED) answer('prayed');
        else if (dx < -threshold || vx < -FLICK_SPEED) answer('missed');
        else springBack();
      },
      onPanResponderTerminate: springBack,
    });
    // `answer` is recreated every render; it only needs to see the current prayer, which `index` stands for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, size.width, index, dragX, reduceMotion]);

  const { width, height } = size;
  const half = width / 2;
  const regionTop = headerBottom + 8;
  const regionHeight = Math.max(0, height - regionTop);
  const measured = width > 0 && regionHeight > 0;
  const scaleUp = measured ? coverScale(regionHeight, regionTop + regionHeight / 2, height) : 1;

  const tilt = dragX.interpolate({
    inputRange: [-Math.max(half, 1), Math.max(half, 1)],
    outputRange: [`-${MAX_TILT_DEG}deg`, `${MAX_TILT_DEG}deg`],
    extrapolate: 'clamp',
  });

  // A shape scaled about its screen edge: the view scales about its centre, so it is moved to keep the edge fixed.
  const fromEdge = (side: Side, progress: Animated.Value, target: number) => ({
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, anchorShift(side, half, target)] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, target] }) },
    ],
  });

  const press = (side: Side, choice: LogChoice) => (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    // Screen readers activate without a touch position, so a missing position counts as a hit.
    const hit = !Number.isFinite(locationX) || !Number.isFinite(locationY) || insideHalfEllipse(side, locationX, locationY, half, regionHeight);
    if (hit) answer(choice);
  };

  const panel = (side: Side, choice: LogChoice, label: string, spoken: string, color: string, textColor: string) => {
    const chosen = result?.choice === choice;
    const shrinking = result !== null && !chosen;
    return (
      <Animated.View
        key={side}
        style={[
          styles.panel,
          { left: side === 'left' ? 0 : half, top: regionTop, width: half, height: regionHeight },
          shrinking && fromEdge(side, grow, 0),
        ]}
      >
        <HalfEllipse side={side} color={color} width={half} height={regionHeight} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={spoken}
          onPress={press(side, choice)}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.label, { opacity: grow.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
        >
          <Text variant="choice" style={{ color: textColor }}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root} onLayout={(event) => setSize(event.nativeEvent.layout)}>
      <StatusBar style="dark" />
      {done ? (
        <AllCaughtUp prayed={counts.prayed} missed={counts.missed} />
      ) : (
        <View style={StyleSheet.absoluteFill} importantForAccessibility={result ? 'no-hide-descendants' : 'auto'}>
          <View style={styles.header} onLayout={(event) => setHeaderBottom(event.nativeEvent.layout.y + event.nativeEvent.layout.height)}>
            <Text variant="ask" color="muted">
              Did you pray?
            </Text>
            <Animated.View {...pan.panHandlers} style={[styles.nameWrap, { transform: [{ translateX: dragX }, { rotate: tilt }] }]}>
              <Text variant="giant" numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
                {item ? PRAYER_LABELS[item.prayer] : ''}
              </Text>
            </Animated.View>
            <Text variant="row" color="muted">
              {item ? `${formatTime(item.time)} · ${index + 1} of ${items.length}` : ''}
            </Text>
          </View>
          {measured && item ? (
            <>
              {panel('left', 'missed', 'No', `No, I missed ${PRAYER_LABELS[item.prayer]}`, colors.state.missedSoft, colors.state.missed)}
              {panel('right', 'prayed', 'Yes', `Yes, I prayed ${PRAYER_LABELS[item.prayer]}`, colors.bg.sage, colors.brand.green)}
            </>
          ) : null}
        </View>
      )}

      {result ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlay }]}>
          {reduceMotion || !measured ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: FILL_COLOR[result.choice] }]} />
          ) : (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.panel,
                { left: SIDE_FOR[result.choice] === 'left' ? 0 : half, top: regionTop, width: half, height: regionHeight },
                fromEdge(SIDE_FOR[result.choice], fill, scaleUp),
              ]}
            >
              <HalfEllipse side={SIDE_FOR[result.choice]} color={FILL_COLOR[result.choice]} width={half} height={regionHeight} />
            </Animated.View>
          )}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: content }]}>
            <ResultContent choice={result.choice} prayer={result.item.prayer} />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  header: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 24, gap: 4 },
  nameWrap: { alignSelf: 'stretch', alignItems: 'center' },
  panel: { position: 'absolute' },
  label: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
