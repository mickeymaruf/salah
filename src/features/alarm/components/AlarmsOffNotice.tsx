import { Pressable, StyleSheet, View } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';

export function AlarmsOffNotice({ onFix }: { onFix: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Alarms are off. Turn on notifications"
      onPress={onFix}
      style={styles.notice}
    >
      <BellOff size={20} color={colors.state.missed} strokeWidth={1.75} />
      <View style={styles.text}>
        <Text variant="rowStrong">Alarms are off</Text>
        <Text variant="small" color="muted">
          Turn on notifications so Salah can ring at each prayer.
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    padding: 16,
    borderRadius: radii.cardSmall,
    borderWidth: 1,
    borderColor: colors.state.missed,
    backgroundColor: colors.bg.surface,
  },
  text: { flex: 1, gap: 2 },
});
