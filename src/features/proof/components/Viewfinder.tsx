import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/shared/theme';

const INSET = 30;
const ARM = 42;

// Rounded frame with four corner brackets. The camera preview or a message goes inside.
export function Viewfinder({ children }: { children: ReactNode }) {
  return (
    <View style={styles.frame}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
    </View>
  );
}

const corner = { position: 'absolute', width: ARM, height: ARM, borderColor: colors.brand.onDark } as const;

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 342 / 470,
    borderRadius: radii.viewfinder,
    overflow: 'hidden',
    backgroundColor: colors.camera.gradientBottom,
  },
  corner: { ...corner },
  topLeft: { top: INSET, left: INSET, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 14 },
  topRight: { top: INSET, right: INSET, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 14 },
  bottomLeft: { bottom: INSET, left: INSET, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 14 },
  bottomRight: { bottom: INSET, right: INSET, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 14 },
});
