import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '@/shared/ui';
import { colors, spacing } from '@/shared/theme';

interface AllCaughtUpProps {
  prayed: number;
  missed: number;
}

export function AllCaughtUp({ prayed, missed }: AllCaughtUpProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <View style={styles.circle}>
          <Check size={44} color={colors.bg.surface} strokeWidth={1.5} />
        </View>
        <Text variant="hero" style={styles.title} accessibilityRole="header">
          All caught up
        </Text>
        <Text variant="row" color="muted">{`${prayed} prayed · ${missed} missed`}</Text>
      </View>
      <View style={{ paddingBottom: Math.max(insets.bottom, spacing.lg) + 18 }}>
        <Button label="Go to Today" onPress={() => router.dismissTo('/today')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.screenX },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { textAlign: 'center' },
});
