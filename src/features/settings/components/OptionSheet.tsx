import { Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { BottomSheet, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';

interface OptionSheetProps<T extends string | number> {
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

// Mount it to open, unmount it to close.
export function OptionSheet<T extends string | number>({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
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
                close();
              }}
              style={styles.option}
            >
              <Text variant="body">{option.label}</Text>
              {option.value === selected ? <Check size={20} color={colors.brand.green} strokeWidth={2} /> : null}
            </Pressable>
          ))}
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 8 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
