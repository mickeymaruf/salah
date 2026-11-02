import { StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';

export function StepDots({ step, total = 2 }: { step: number; total?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < step ? colors.brand.green : colors.heat[0] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 4, borderRadius: 2 },
});
