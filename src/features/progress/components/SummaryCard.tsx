import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Text } from '@/shared/ui';
import { colors, type TextColor } from '@/shared/theme';
import type { YearStats } from '../stats';
import { formatStreak } from '../stats';

const ICONS = {
  prayed: require('../../../../assets/images/button-prayed.png'),
  missed: require('../../../../assets/images/button-missed.png'),
  streak: require('../../../../assets/images/stat-streak.png'),
} as const;

const ICON_SIZE = 38;

interface StatPillProps {
  icon: ImageSourcePropType;
  value: string;
  label: string;
  valueColor?: TextColor;
}

function StatPill({ icon, value, label, valueColor = 'primary' }: StatPillProps) {
  return (
    <View style={styles.pill}>
      <Image source={icon} style={styles.icon} accessibilityIgnoresInvertColors />
      <View style={styles.pillText}>
        <Text variant="statValue" color={valueColor} numberOfLines={1}>
          {value}
        </Text>
        <Text variant="statLabel" color="muted" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// The sage card at the top of Progress (Figma 18035:29): the share of prayers kept and three pills for prayed, missed and the best streak.
export function SummaryCard({ stats }: { stats: YearStats }) {
  const empty = stats.percentKept === null;
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.titles}>
          <Text variant="tinyMedium" color="muted">
            {empty ? 'Pray today to start your year' : 'Your progress'}
          </Text>
          <Text variant="cardTitle">Prayers kept</Text>
        </View>
        <Text variant="percent" color="brand" numberOfLines={1}>
          {empty ? '—' : `${stats.percentKept}%`}
        </Text>
      </View>
      <View style={styles.stats}>
        <StatPill icon={ICONS.prayed} value={String(stats.prayed)} label="Prayed" />
        <StatPill icon={ICONS.missed} value={String(stats.missed)} label="Missed" valueColor="missed" />
        <StatPill icon={ICONS.streak} value={formatStreak(stats.bestStreak)} label="Streak" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg.sage, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titles: { flexShrink: 1, gap: 2 },
  stats: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
  },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
  pillText: { flexShrink: 1, gap: 1 },
});
