import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors, sizes } from '@/shared/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  // Replaces the value and chevron, for example with a toggle.
  right?: ReactNode;
}

export function SettingsRow({ label, value, onPress, right }: SettingsRowProps) {
  const content = (
    <>
      <Text variant="row">{label}</Text>
      <View style={styles.spacer} />
      {right ?? (
        <>
          {value ? (
            <Text variant="label" color="muted" style={styles.value}>
              {value}
            </Text>
          ) : null}
          <ChevronRight size={18} color={colors.ink.muted} strokeWidth={1.75} />
        </>
      )}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: sizes.rowHeight, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { backgroundColor: colors.bg.base },
  spacer: { flex: 1 },
  value: { fontSize: 15 },
});
