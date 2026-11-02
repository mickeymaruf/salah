import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/shared/ui';

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card radius={16} style={styles.card}>
      <View style={styles.inner}>
        <Text variant="caption" color="muted" style={styles.label}>
          {label}
        </Text>
        <Text variant="title">{value}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  inner: { paddingHorizontal: 15, paddingVertical: 13, gap: 2 },
  label: { fontSize: 12 },
});
