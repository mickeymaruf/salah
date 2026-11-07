import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { ASSET_SIZE, LEAVES, isVisible, type Leaf } from '../leaves';
import { FADE_MS, SETTLE_MS } from '../transition';
import type { DropItem, GroupItem } from '../useTreeAnimation';

const BARE_TREE = require('../../../../assets/images/tree-bare.png');
const SPRING = { stiffness: 220, damping: 18, mass: 1 } as const;
const FALL_EASING = Easing.bezier(0.4, 0, 0.6, 1);
const RESTING_OPACITY = 0.85;

interface CanvasProps {
  // Screen pixels per asset pixel.
  scale: number;
  staticFullness: number;
  hidden: ReadonlySet<number>;
  groups: readonly GroupItem[];
  drops: readonly DropItem[];
  onLanded: (key: string) => void;
  onGone: (key: string) => void;
}

// The bare tree, the leaves that are simply there (one SVG), the leaves that are growing or fading as groups,
// and the leaves that fell, which stay on the grass. All layers share the asset's 1810 x 1810 box.
export function TreeCanvas({ scale, staticFullness, hidden, groups, drops, onLanded, onGone }: CanvasProps) {
  const size = ASSET_SIZE * scale;
  const still = useMemo(
    () => LEAVES.filter((leaf) => isVisible(leaf, staticFullness) && !hidden.has(leaf.id)),
    [staticFullness, hidden],
  );
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Image source={BARE_TREE} style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }} resizeMode="stretch" />
      <LeafLayer leaves={still} size={size} />
      {groups.map((group) => (
        <LeafGroup key={group.key} group={group} scale={scale} size={size} />
      ))}
      {drops.map((drop) => (
        <DropLeaf key={drop.key} drop={drop} scale={scale} onLanded={onLanded} onGone={onGone} />
      ))}
    </View>
  );
}

const LeafLayer = memo(function LeafLayer({ leaves, size }: { leaves: readonly Leaf[]; size: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${ASSET_SIZE} ${ASSET_SIZE}`} style={StyleSheet.absoluteFill}>
      {leaves.map((leaf) => (
        <Polygon key={leaf.id} points={leaf.points} fill={leaf.color} />
      ))}
    </Svg>
  );
});

// A group of leaves that fade and scale in with a light spring, or fade out. Scales about the middle of the group.
function LeafGroup({ group, scale, size }: { group: GroupItem; scale: number; size: number }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation =
      group.mode === 'in'
        ? Animated.sequence([
            Animated.delay(group.delay),
            Animated.spring(progress, { ...SPRING, toValue: 1, useNativeDriver: true }),
          ])
        : Animated.sequence([
            Animated.delay(group.delay),
            Animated.timing(progress, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]);
    animation.start();
    return () => animation.stop();
  }, [group, progress]);

  const origin = useMemo(() => {
    const count = group.leaves.length || 1;
    const x = group.leaves.reduce((sum, leaf) => sum + leaf.cx, 0) / count;
    const y = group.leaves.reduce((sum, leaf) => sum + leaf.cy, 0) / count;
    return `${x * scale}px ${y * scale}px`;
  }, [group.leaves, scale]);

  const grow = group.mode === 'in';
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: grow ? [0, 1] : [1, 0], extrapolate: 'clamp' });
  const zoom = progress.interpolate({ inputRange: [0, 1], outputRange: grow ? [0.6, 1] : [1, 1] });
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { width: size, height: size, opacity, transform: [{ scale: zoom }], transformOrigin: origin }]}
    >
      <LeafLayer leaves={group.leaves} size={size} />
    </Animated.View>
  );
}

interface DropProps {
  drop: DropItem;
  scale: number;
  onLanded: (key: string) => void;
  onGone: (key: string) => void;
}

// One leaf that falls: straight down to the grass with a side sway and a spin, then settles at a resting angle.
// It stays mounted so it keeps lying on the grass; a leaf that is told to fade out fades in 300 ms and is removed.
const DropLeaf = memo(function DropLeaf({ drop, scale, onLanded, onGone }: DropProps) {
  const { spec, key, phase } = drop;
  const { leaf } = spec;
  const [progress] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(spec.delay),
      Animated.timing(progress, { toValue: 1, duration: spec.duration, easing: FALL_EASING, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 2, duration: SETTLE_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onLanded(key);
    });
    return () => animation.stop();
    // The animation runs once, when the leaf is added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'fading') return;
    Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onGone(key);
    });
  }, [phase, fade, key, onGone]);

  const dx = (spec.landX - leaf.cx) * scale;
  const dy = (spec.landY - leaf.cy) * scale;
  const sway = (u: number) => spec.sway * Math.sin(2 * Math.PI * u);
  const KEYS = [0, 0.25, 0.5, 0.75, 1, 2];
  const translateX = progress.interpolate({
    inputRange: KEYS,
    outputRange: KEYS.map((k) => dx * Math.min(k, 1) + sway(Math.min(k, 1))),
  });
  const translateY = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [0, dy, dy] });
  const rotate = progress.interpolate({ inputRange: [0, 1, 2], outputRange: ['0deg', `${spec.spin}deg`, `${spec.restAngle}deg`] });
  const settled = progress.interpolate({ inputRange: [0, 1, 2], outputRange: [1, RESTING_OPACITY, RESTING_OPACITY] });
  const opacity = Animated.multiply(settled, fade);
  const width = leaf.w * scale;
  const height = leaf.h * scale;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: leaf.x * scale,
        top: leaf.y * scale,
        width,
        height,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${leaf.w} ${leaf.h}`}>
        <Polygon points={leaf.localPoints} fill={leaf.color} />
      </Svg>
    </Animated.View>
  );
});
