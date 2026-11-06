import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Text } from '@/shared/ui';
import { colors, type TextColor } from '@/shared/theme';
import { formatStreak, type YearStats } from '../stats';

const ICONS = {
  prayed: require('../../../../assets/images/stat-prayed.png'),
  missed: require('../../../../assets/images/stat-missed.png'),
  streak: require('../../../../assets/images/stat-streak.png'),
} as const;

const ICON_SIZE = 40;

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
      <View style={styles.text}>
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

// The three round pills under the Progress header (Figma 18035:35): prayed, missed and the best streak, each with a 3D icon.
export function StatPills({ stats }: { stats: YearStats }) {
  return (
    <View style={styles.row}>
      <StatPill icon={ICONS.prayed} value={String(stats.prayed)} label="Prayed" />
      <StatPill icon={ICONS.missed} value={String(stats.missed)} label="Missed" valueColor="missed" />
      <StatPill icon={ICONS.streak} value={formatStreak(stats.bestStreak)} label="Streak" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 5,
    paddingRight: 8,
    paddingVertical: 11,
    borderRadius: 32,
    backgroundColor: colors.bg.surface,
  },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
  text: { flexShrink: 1, gap: 1 },
});
