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
// Figma: the countdown ends 15 px above the sheet. Line heights are Inter's normal height (1.21 x size) so Android lays the block out the same.
const TEXT_GAP = 15;
const NAME_LINE = 48;
const RANGE_LINE = 27;
const COUNTDOWN_LINE = 19;
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
        style={[styles.text, { height: sheetTop }]}
      >
        <Text variant="heroName" color="brand" style={styles.name}>
          {PRAYER_LABELS[window.name]}
        </Text>
        <Text variant="heroRange" style={styles.range}>{`${formatTime(window.start)} – ${formatTime(window.end)}`}</Text>
        <Text variant="row" color="muted" style={styles.countdown}>
          {`${PRAYER_LABELS[window.nextName]} ${formatCountdown(window.end.getTime() - at.getTime())}`}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute' },
  // The block fills the hero and keeps its text at the bottom, so it rests above the sheet whatever the font's line height.
  text: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: TEXT_GAP },
  name: { lineHeight: NAME_LINE, includeFontPadding: false },
  range: { lineHeight: RANGE_LINE, marginTop: 2, includeFontPadding: false },
  countdown: { lineHeight: COUNTDOWN_LINE, marginTop: 3, includeFontPadding: false },
});
