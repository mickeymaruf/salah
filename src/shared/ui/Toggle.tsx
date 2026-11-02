import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[styles.track, { backgroundColor: value ? colors.brand.green : colors.line.soft }]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand.onDark },
  knobOn: { alignSelf: 'flex-end', marginRight: 3 },
  knobOff: { alignSelf: 'flex-start', marginLeft: 3 },
});
