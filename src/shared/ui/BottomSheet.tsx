import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '@/shared/theme';

interface BottomSheetProps {
  // A function receives `close`, which plays the exit animation and then calls `onClose`.
  children: ReactNode | ((close: () => void) => ReactNode);
  onClose: () => void;
}

const OPEN_MS = 280;
const CLOSE_MS = 200;

// Mount it to open. Close through `close` (or the scrim or back button) so the exit animation plays
// before the parent unmounts it.
// One native-driven value moves the sheet by its own height and fades the scrim, so nothing runs on the JS thread.
// The scrim fills the whole window behind the sheet, which keeps the rounded corners visible, and the
// modal is translucent under the status and navigation bars so the dimming reaches every edge.
export function BottomSheet({ children, onClose }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(0);
  const started = useRef(false);
  const [closing, setClosing] = useState(false);

  // Wait for the first measurement so the slide distance is exact and there is no flash at the final position.
  useEffect(() => {
    if (height === 0 || started.current) return;
    started.current = true;
    Animated.timing(progress, {
      toValue: 1,
      duration: OPEN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [height, progress]);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(onClose);
  }, [progress, onClose, closing]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height || 600, 0] });

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <Pressable accessibilityLabel="Close" style={styles.scrim} onPress={close} />
        </Animated.View>
        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 18, transform: [{ translateY }] }]}
        >
          <View style={styles.grabber} />
          {typeof children === 'function' ? children(close) : children}
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
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line.soft,
    marginBottom: 20,
  },
});
