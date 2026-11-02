import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import { Text } from './Text';

export function ScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        onPress={() => router.back()}
        style={styles.back}
      >
        <ChevronLeft size={24} color={colors.ink.primary} strokeWidth={2} />
      </Pressable>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: sizes.iconButton },
  back: { width: 32, height: sizes.iconButton, justifyContent: 'center', marginLeft: -4 },
});
