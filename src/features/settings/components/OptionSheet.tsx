import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';

interface OptionSheetProps<T extends string | number> {
  visible: boolean;
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export function OptionSheet<T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: option.value === selected }}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
            style={styles.option}
          >
            <Text variant="body">{option.label}</Text>
            {option.value === selected ? <Check size={20} color={colors.brand.green} strokeWidth={2} /> : null}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(16,36,30,0.4)' },
  sheet: {
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  title: { marginBottom: 8 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
