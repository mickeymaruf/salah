import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Card, Text } from '@/shared/ui';
import { colors, fontFamily } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES, type DayTimes } from '@/features/prayer-times/calculate';

interface LocationCardProps {
  title: string;
  subtitle: string;
  times: DayTimes | null;
  // Shown at the top right once times exist.
  onEditTimes?: () => void;
}

export function LocationCard({ title, subtitle, times, onEditTimes }: LocationCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.city}>
        <View style={styles.pin}>
          <MapPin size={20} color={colors.brand.green} strokeWidth={1.75} />
        </View>
        <View style={styles.cityText}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="caption" color="muted">
            {subtitle}
          </Text>
        </View>
        {times && onEditTimes ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onEditTimes} style={styles.edit}>
            <Text variant="label" color="brand">
              Edit times
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.divider} />
      {PRAYER_NAMES.map((name) => (
        <View key={name} style={styles.row}>
          <Text variant="row">{PRAYER_LABELS[name]}</Text>
          <Text variant="row" style={styles.time} color={times ? 'primary' : 'muted'}>
            {times ? formatTime(times[name]) : '--:--'}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 16 },
  city: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityText: { flex: 1, gap: 2 },
  edit: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: -4 },
  divider: { height: 1, backgroundColor: colors.line.soft },
  row: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontFamily: fontFamily.medium },
});
