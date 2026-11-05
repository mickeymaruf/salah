import { useMemo } from 'react';
import { PanResponder, type PanResponderInstance } from 'react-native';

const MIN_DISTANCE = 40;

// Claims a gesture only when it is clearly sideways, so vertical scrolling of the page keeps working.
// Swiping left calls `onNext` and swiping right calls `onPrevious`, like turning pages.
export function useHorizontalSwipe(onPrevious: (() => void) | undefined, onNext: (() => void) | undefined): PanResponderInstance {
  return useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, { dx, dy }) => Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 2,
        onPanResponderRelease: (_event, { dx }) => {
          if (dx <= -MIN_DISTANCE) onNext?.();
          else if (dx >= MIN_DISTANCE) onPrevious?.();
        },
      }),
    [onPrevious, onNext],
  );
}
