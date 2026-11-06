import { useMemo } from 'react';
import { Animated, PanResponder, type PanResponderInstance } from 'react-native';

const CLOSE_DRAG = 80;
const CLOSE_FLICK = 0.8;

// Claims a gesture only when it is clearly downward, so taps on the sheet's buttons keep working. `drag` follows the finger. Letting
// go past 80 px or with a quick flick calls `onClose`; a shorter drag springs back.
export function useSwipeDown(drag: Animated.Value, onClose: () => void): PanResponderInstance {
  return useMemo(() => {
    const springBack = () => Animated.spring(drag, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, { dy, dx }) => dy > 6 && dy > Math.abs(dx),
      onPanResponderMove: Animated.event([null, { dy: drag }], { useNativeDriver: false }),
      onPanResponderRelease: (_event, { dy, vy }) => {
        if (dy > CLOSE_DRAG || vy > CLOSE_FLICK) onClose();
        else springBack();
      },
      onPanResponderTerminate: springBack,
    });
  }, [drag, onClose]);
}
