import { Image, Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '@/shared/ui';
import { colors, radii, spacing } from '@/shared/theme';
import { GOAL_DAYS } from '../treeProgress';

const FLAME = require('../../../../assets/images/tree-flame.png');
const EDGE = 1.25;
const GLOW = 12;

interface LeafCardProps {
  // Whole numbers for the counts; `fullness` runs 0 to 1 and may be between two values while it counts.
  perfectDays: number;
  streak: number;
  fullness: number;
}

// The glass goal card. Figma gives it a 28 px background blur, two inner shadows and a gradient edge. The blur has
// almost nothing to blur here, so it is left out; the glows behind it are radial fades.
export function LeafCard({ perfectDays, streak, fullness }: LeafCardProps) {
  const percent = Math.round(fullness * 100);
  const full = perfectDays >= GOAL_DAYS;
  const daysToGo = Math.max(0, GOAL_DAYS - perfectDays);
  return (
    <View style={styles.wrap}>
      <Glows />
      <View style={styles.card}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.glass.edgeStart} />
              <Stop offset="1" stopColor={colors.glass.edgeEnd} />
            </LinearGradient>
          </Defs>
          <Rect
            x={EDGE / 2}
            y={EDGE / 2}
            width="99%"
            height="99%"
            rx={radii.card - EDGE / 2}
            fill="none"
            stroke="url(#edge)"
            strokeWidth={EDGE}
          />
        </Svg>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text variant="bodyStrong">Grow a full tree</Text>
            <View style={styles.chip}>
              <Text variant="tinyMedium" color="brand">{`${percent}% full`}</Text>
            </View>
          </View>
          <Text variant="tiny" color="muted" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            Pray all 5 prayers every day for 40 days.
          </Text>
        </View>
        <View style={styles.count}>
          <Text variant="treeCount">{String(perfectDays)}</Text>
          <Text variant="small" color="muted">{`of ${GOAL_DAYS} perfect days`}</Text>
        </View>
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Tree fullness"
          accessibilityValue={{ min: 0, max: 100, now: percent }}
        >
          <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, fullness * 100))}%` }]} />
        </View>
        <View style={styles.row}>
          <View style={styles.streak}>
            <Image source={FLAME} style={styles.flame} accessibilityIgnoresInvertColors />
            <View>
              <Text variant="dayTitle">{`${streak}-day streak`}</Text>
              <Text variant="tiny" color="muted">
                all 5 prayers, every day
              </Text>
            </View>
          </View>
          <View style={styles.goal}>
            <Text variant="dayTitle">{full ? 'Tree is full' : `${daysToGo} ${daysToGo === 1 ? 'day' : 'days'} to go`}</Text>
            <Text variant="tiny" color="muted">
              {full ? 'keep your streak' : 'to a full tree'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Two soft glows at 12%: brand green low on the left, warm orange on the right.
function Glows() {
  return (
    <Svg style={styles.glows} pointerEvents="none" width="100%" height="100%">
      <Defs>
        <RadialGradient id="glowGreen" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={colors.brand.green} stopOpacity={GLOW / 100} />
          <Stop offset="1" stopColor={colors.brand.green} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="glowWarm" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={colors.glowWarm} stopOpacity={GLOW / 100} />
          <Stop offset="1" stopColor={colors.glowWarm} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="-8%" y="35%" width="62%" height="90%" fill="url(#glowGreen)" />
      <Rect x="58%" y="-10%" width="52%" height="80%" fill="url(#glowWarm)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  glows: { position: 'absolute', left: -20, right: -20, top: -20, bottom: -20 },
  card: {
    borderRadius: radii.card,
    backgroundColor: colors.glass.fill,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: spacing.md,
    ...Platform.select({
      ios: { shadowColor: colors.glass.shadow, shadowOpacity: 0.07, shadowRadius: 13, shadowOffset: { width: 0, height: 0 } },
      default: {},
    }),
  },
  titleBlock: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: { backgroundColor: colors.bg.sage, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  track: { height: 6, borderRadius: radii.bar, backgroundColor: colors.line.soft, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radii.bar, backgroundColor: colors.brand.green },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  flame: { width: 40, height: 40, mixBlendMode: 'multiply' },
  goal: { alignItems: 'flex-end' },
});
