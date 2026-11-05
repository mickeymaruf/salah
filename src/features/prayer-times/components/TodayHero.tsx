import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatCountdown, formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS } from '../calculate';
import { arcPoint, halfCircleLength, halfCirclePath, type PrayerWindow } from '../window';

const RADIUS = 160;
const STROKE = 3;
const DOT = 18;
const DOT_OUTLINE = 3;
// The svg is wider and taller than the arc so the dot is never cut off at either end or at the top.
const SVG_WIDTH = 360;
const ARC_BASE = 190;
const SVG_HEIGHT = ARC_BASE + 10;
const CX = SVG_WIDTH / 2;

interface TodayHeroProps {
  window: PrayerWindow;
  at: Date;
  // Where the prayer sheet starts. The flat ends of the half circle rest on it.
  sheetTop: number;
  width: number;
}

// The prayer in progress inside a thin half circle. A green arc shows how far through the window it is.
export function TodayHero({ window, at, sheetTop, width }: TodayHeroProps) {
  const length = halfCircleLength(RADIUS);
  const dot = arcPoint(window.progress, CX, ARC_BASE, RADIUS);
  const path = halfCirclePath(CX, ARC_BASE, RADIUS);

  return (
    <>
      <Svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        pointerEvents="none"
        style={[styles.ring, { left: (width - SVG_WIDTH) / 2, top: sheetTop - ARC_BASE }]}
      >
        <Path d={path} stroke={colors.line.soft} strokeWidth={STROKE} fill="none" />
        <Path
          d={path}
          stroke={colors.brand.green}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${length * window.progress} ${length}`}
        />
        <Circle cx={dot.x} cy={dot.y} r={DOT / 2 + DOT_OUTLINE} fill={colors.bg.surface} />
        <Circle cx={dot.x} cy={dot.y} r={DOT / 2} fill={colors.brand.green} />
      </Svg>
      <View
        pointerEvents="none"
        accessible
        accessibilityLabel={`${PRAYER_LABELS[window.name]}, ${formatTime(window.start)} to ${formatTime(window.end)}. ${PRAYER_LABELS[window.nextName]} ${formatCountdown(window.end.getTime() - at.getTime())}`}
        style={[styles.text, { top: sheetTop - 114 }]}
      >
        <Text variant="heroName" color="brand">
          {PRAYER_LABELS[window.name]}
        </Text>
        <Text variant="heroRange">{`${formatTime(window.start)} – ${formatTime(window.end)}`}</Text>
        <Text variant="row" color="muted">
          {`${PRAYER_LABELS[window.nextName]} ${formatCountdown(window.end.getTime() - at.getTime())}`}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute' },
  text: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 2 },
});
