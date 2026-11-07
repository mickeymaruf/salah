import { Pressable, StyleSheet, View } from 'react-native';
import type { MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartColumn, Clock, TreePine } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import { Text } from './Text';

const ICONS = { today: Clock, progress: ChartColumn, tree: TreePine } as const;

// Bottom bar for the swipeable tabs. It matches the Figma tab bar: icon over label, green when active.
// The bottom inset is the system navigation bar (three buttons or the gesture line) on phones that have one, so the
// bar sits above it. Phones without one report 0 and the bar sits at the very bottom.
export function TabBar({ state, descriptors, navigateToTab }: MaterialTopTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { height: sizes.tabBarContent + bottom, paddingBottom: bottom }]}>
      {state.routes.map((route: { key: string; name: string }, index: number) => {
        const active = state.index === index;
        const color = active ? colors.brand.green : colors.ink.muted;
        const Icon = ICONS[route.name as keyof typeof ICONS];
        const title = descriptors[route.key].options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={title}
            onPress={() => navigateToTab(route.key)}
            style={styles.tab}
          >
            {Icon ? <Icon size={24} color={color} strokeWidth={1.75} /> : null}
            <Text variant={active ? 'tab' : 'tabInactive'} style={{ color }}>
              {title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line.soft,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 4 },
});
