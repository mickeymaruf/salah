import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '@/shared/theme';

interface CardProps {
  children: ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, radius = radii.card, style }: CardProps) {
  return <View style={[styles.card, { borderRadius: radius }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.line.soft,
    overflow: 'hidden',
  },
});
