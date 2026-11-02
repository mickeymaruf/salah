import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';

export function UserButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      onPress={() => router.push('/settings')}
      style={styles.button}
    >
      <User size={22} color={colors.ink.primary} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: sizes.iconButton / 2,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.line.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
