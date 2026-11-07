import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useIsFocused } from 'expo-router';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { useProfileStore } from '@/shared/state/profileStore';
import type { Profile } from '@/shared/state/profile';
import { Screen, Text } from '@/shared/ui';
import { spacing } from '@/shared/theme';
import { Halo, HALO_SIZE } from './components/Halo';
import { LeafCard } from './components/LeafCard';
import { TreeCanvas } from './components/TreeCanvas';
import { ART_BOTTOM, ART_TOP, ASSET_SIZE } from './leaves';
import { useCountTo } from './useCountTo';
import { useTreeAnimation } from './useTreeAnimation';
import { useTreeProgress } from './useTreeProgress';

// Figma draws the 1810 px asset at 0.205 (371 px) on a 390 px screen. Smaller or shorter screens scale it down.
const FIGMA_SCALE = 0.205;
const ART_HEIGHT = ART_BOTTOM - ART_TOP;
const ART_CENTER = (ART_TOP + ART_BOTTOM) / 2;
const SIDE_MARGIN = 19;
const TOP_GAP = 8;

export function TreeScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Tree profile={profile} /> : null;
}

function Tree({ profile }: { profile: Profile }) {
  const progress = useTreeProgress(profile);
  const focused = useIsFocused();
  const reduceMotion = useReduceMotion();
  const tree = useTreeAnimation({ progress, focused, reduceMotion });
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);

  const { value, animate } = tree.shown;
  const perfectDays = Math.round(useCountTo(value.perfectDays, animate));
  const streak = Math.round(useCountTo(value.streak, animate));
  const fullness = useCountTo(value.fullness, animate);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  };

  const scale = area
    ? Math.min(FIGMA_SCALE, (area.width - SIDE_MARGIN) / ASSET_SIZE, (area.height - TOP_GAP) / ART_HEIGHT)
    : FIGMA_SCALE;
  const centre = area ? { x: area.width / 2, y: area.height / 2 } : { x: 0, y: 0 };
  const label = `Your tree is ${Math.round(fullness * 100)}% full`;

  return (
    <Screen bottomInset={false} style={styles.screen}>
      <View style={styles.header}>
        <Text variant="heading">Your tree</Text>
        <Text variant="small" color="muted" style={styles.subtitle}>
          A leaf for every prayer you complete.
        </Text>
      </View>
      <View style={styles.area} onLayout={onLayout}>
        {area && tree.started ? (
          <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={label} pointerEvents="none">
            <View
              style={[
                styles.halo,
                {
                  width: HALO_SIZE.width,
                  height: HALO_SIZE.height,
                  left: centre.x - HALO_SIZE.width / 2,
                  top: centre.y - HALO_SIZE.height / 2,
                },
              ]}
            >
              <Halo />
            </View>
            <View
              style={{
                position: 'absolute',
                left: centre.x - (ASSET_SIZE * scale) / 2,
                top: centre.y - ART_CENTER * scale,
              }}
            >
              <TreeCanvas
                scale={scale}
                staticFullness={tree.staticFullness}
                hidden={tree.hidden}
                groups={tree.groups}
                drops={tree.drops}
                onLanded={tree.onLanded}
                onGone={tree.onGone}
              />
            </View>
          </View>
        ) : null}
      </View>
      <View style={[styles.card, !tree.started && styles.hidden]}>
        <LeafCard perfectDays={perfectDays} streak={streak} fullness={fullness} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: { paddingHorizontal: spacing.screenX, paddingTop: spacing.sm, gap: 4 },
  subtitle: { lineHeight: 20 },
  area: { flex: 1 },
  halo: { position: 'absolute' },
  card: { paddingHorizontal: spacing.screenX, paddingBottom: 20 },
  hidden: { opacity: 0 },
});
