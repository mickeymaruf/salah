import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '@/shared/theme';

interface BottomSheetProps {
  children: ReactNode;
  onClose: () => void;
}

// Mount it to open, unmount it to close.
// The scrim fills the whole window and sits behind the sheet, so it also shows through the rounded
// corners. The modal is translucent under the status bar and navigation bar so the dimming reaches
// every edge on any device.
export function BottomSheet({ children, onClose }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [offset] = useState(() => new Animated.Value(80));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(offset, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [offset, fade]);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <Pressable accessibilityLabel="Close" style={styles.scrim} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 18, transform: [{ translateY: offset }] }]}
        >
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.bg.base,
    borderTopLeftRadius: radii.viewfinder,
    borderTopRightRadius: radii.viewfinder,
    paddingTop: 12,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line.soft, marginBottom: 20 },
});
