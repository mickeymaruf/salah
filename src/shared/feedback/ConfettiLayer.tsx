import { memo, useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactElement } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import {
  BIG_MS,
  buildConfetti,
  FADE_START,
  NORMAL_MS,
  pieceCount,
  piecePosition,
  SHAPES,
  type ConfettiPiece,
} from './confetti';

const SAMPLES = 8;
const PULSE_MS = 450;
const PULSE_SIZE = 44;

// What a ref to a View holds: the mounted view, which can report where it is on the screen.
export type ViewHandle = ComponentRef<typeof View>;

interface BurstSpec {
  id: number;
  x: number;
  y: number;
  big: boolean;
  pieces: ConfettiPiece[];
}

interface BurstOptions {
  // The fifth prayer of the day: twice the pieces, a little longer.
  big?: boolean;
}

interface Confetti {
  // Draw this above the content that bursts come from. It never takes a touch.
  layer: ReactElement;
  // Bursts from the middle of `from`, a mounted view such as the check button.
  burst: (from: ViewHandle | null, options?: BurstOptions) => void;
}

// A burst of confetti above the screen, or with reduce motion on a single soft green pulse instead. Everything moves with
// transform and opacity only, so it runs on the native driver.
export function useConfetti(): Confetti {
  const reduceMotion = useReduceMotion();
  const layerRef = useRef<ViewHandle>(null);
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<BurstSpec[]>([]);

  const burst = useCallback(
    (from: ViewHandle | null, options?: BurstOptions) => {
      const layer = layerRef.current;
      if (!from || !layer) return;
      const big = options?.big ?? false;
      from.measureInWindow((fx, fy, fw, fh) => {
        layer.measureInWindow((lx, ly) => {
          const pieces = reduceMotion ? [] : buildConfetti(pieceCount(big, Math.random), colors.confetti, Math.random);
          const spec: BurstSpec = { id: nextId.current++, x: fx + fw / 2 - lx, y: fy + fh / 2 - ly, big, pieces };
          setBursts((list) => [...list, spec]);
        });
      });
    },
    [reduceMotion],
  );

  const remove = useCallback((id: number) => setBursts((list) => list.filter((item) => item.id !== id)), []);

  const layer = (
    <View ref={layerRef} pointerEvents="none" style={StyleSheet.absoluteFill} collapsable={false}>
      {bursts.map((item) => (item.pieces.length === 0 ? <Pulse key={item.id} spec={item} onDone={remove} /> : <Burst key={item.id} spec={item} onDone={remove} />))}
    </View>
  );
  return { layer, burst };
}

const Burst = memo(function Burst({ spec, onDone }: { spec: BurstSpec; onDone: (id: number) => void }) {
  const [progress] = useState(() => new Animated.Value(0));
  const duration = spec.big ? BIG_MS : NORMAL_MS;

  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished) onDone(spec.id);
    });
    return () => animation.stop();
  }, [progress, duration, onDone, spec.id]);

  // Built once per burst: re-running `interpolate` on every render would hand the native driver new nodes mid-flight.
  const styles = useMemo(() => {
    const opacity = progress.interpolate({ inputRange: [0, FADE_START, 1], outputRange: [1, 1, 0] });
    const inputRange = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);
    return spec.pieces.map((piece) => {
      const size = SHAPES[piece.shape];
      const points = inputRange.map((u) => piecePosition(piece, u));
      return {
        position: 'absolute' as const,
        left: spec.x - size.width / 2,
        top: spec.y - size.height / 2,
        width: size.width,
        height: size.height,
        borderRadius: size.radius,
        backgroundColor: piece.colour,
        opacity,
        transform: [
          { translateX: progress.interpolate({ inputRange, outputRange: points.map((point) => point.x) }) },
          { translateY: progress.interpolate({ inputRange, outputRange: points.map((point) => point.y) }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin}deg`] }) },
        ],
      };
    });
  }, [progress, spec]);

  return (
    <>
      {styles.map((style, index) => (
        <Animated.View key={index} style={style} />
      ))}
    </>
  );
});

// Reduce motion: one soft ring that swells and fades over the check button.
function Pulse({ spec, onDone }: { spec: BurstSpec; onDone: (id: number) => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: PULSE_MS, easing: Easing.out(Easing.quad), useNativeDriver: true });
    animation.start(({ finished }) => {
      if (finished) onDone(spec.id);
    });
    return () => animation.stop();
  }, [progress, onDone, spec.id]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: spec.x - PULSE_SIZE / 2,
        top: spec.y - PULSE_SIZE / 2,
        width: PULSE_SIZE,
        height: PULSE_SIZE,
        borderRadius: PULSE_SIZE / 2,
        backgroundColor: colors.halo,
        opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
      }}
    />
  );
}
