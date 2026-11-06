import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatCountdown, formatCountdownClock } from '@/shared/lib/date';
import { PRAYER_LABELS } from '../calculate';
import { RING_RADIUS, heroScale } from '../heroScale';
import { arcPoint, ringDotCount, ringDots, type PrayerWindow } from '../window';

const DOT_SPACING = 9;
const RING_DOT = 3.5;
// The end dot is 18 px across in Figma: a 12 px green dot inside a 3 px white border.
const END_DOT = 12;
const END_OUTLINE = 3;
// The svg is wider and taller than the arc so the end dot is never cut off at either end or at the top.
const SIDE_ROOM = 20;
const TOP_ROOM = 10;
const BOTTOM_ROOM = 30;
// Figma: the last line ends 16 px above the sheet. The lines have fixed heights (50, 40, 20), so Android lays the block out the same.
const TEXT_GAP = 16;

interface TodayHeroProps {
  window: PrayerWindow;
  at: Date;
  // Where the prayer sheet starts. The flat ends of the half circle rest on it.
  sheetTop: number;
  width: number;
}

// The prayer in progress inside a half circle of dots. Green dots show how far through the window it is, and the end
// dot marks the moment. Under the name a live countdown runs to the next prayer.
function TodayHeroView({ window, at, sheetTop, width }: TodayHeroProps) {
  const radius = RING_RADIUS * heroScale(width);
  const svgWidth = radius * 2 + SIDE_ROOM * 2;
  const arcBase = radius + BOTTOM_ROOM;
  const svgHeight = arcBase + TOP_ROOM;
  const cx = svgWidth / 2;
  const dots = useMemo(() => ringDots(ringDotCount(radius, DOT_SPACING), cx, arcBase, radius), [radius, cx, arcBase]);
  const end = arcPoint(window.progress, cx, arcBase, radius);
  const remaining = window.end.getTime() - at.getTime();
  const { lead, seconds } = formatCountdownClock(remaining);
  const nextLabel = PRAYER_LABELS[window.nextName];

  return (
    <>
      <Svg
        width={svgWidth}
        height={svgHeight}
        pointerEvents="none"
        style={[styles.ring, { left: (width - svgWidth) / 2, top: sheetTop - arcBase }]}
      >
        {dots.map((dot) => (
          <Circle
            key={dot.at}
            cx={dot.x}
            cy={dot.y}
            r={RING_DOT / 2}
            fill={dot.at <= window.progress ? colors.brand.green : colors.line.soft}
          />
        ))}
        <Circle cx={end.x} cy={end.y} r={END_DOT / 2 + END_OUTLINE} fill={colors.bg.surface} />
        <Circle cx={end.x} cy={end.y} r={END_DOT / 2} fill={colors.brand.green} />
      </Svg>
      <View
        pointerEvents="none"
        accessible
        accessibilityLabel={`${PRAYER_LABELS[window.name]}. ${nextLabel} ${formatCountdown(remaining)}`}
        style={[styles.text, { height: sheetTop }]}
      >
        <Text variant="heroName" color="brand" style={styles.name}>
          {PRAYER_LABELS[window.name]}
        </Text>
        <Text variant="heroCountdown" style={styles.countdown}>
          {lead}
          <Text variant="heroCountdown" color="muted">
            {seconds}
          </Text>
        </Text>
        <Text variant="row" color="muted" style={styles.until}>
          {`until ${nextLabel}`}
        </Text>
      </View>
    </>
  );
}

export const TodayHero = memo(TodayHeroView);

const styles = StyleSheet.create({
  ring: { position: 'absolute' },
  // The block fills the hero and keeps its text at the bottom, so it rests above the sheet whatever the font's line height.
  text: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: TEXT_GAP },
  name: { includeFontPadding: false },
  // Digits keep one width so the countdown does not shake as the seconds change.
  countdown: { marginTop: -2, includeFontPadding: false, fontVariant: ['tabular-nums'] },
  until: { lineHeight: 20, includeFontPadding: false },
});
