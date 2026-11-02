import { Pressable, StyleSheet, View } from 'react-native';
import type { MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { ChartColumn, Clock } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import { Text } from './Text';

const ICONS = { today: Clock, progress: ChartColumn } as const;

// Bottom bar for the swipeable tabs. It matches the Figma tab bar: icon over label, green when active.
export function TabBar({ state, descriptors, navigateToTab, insets }: MaterialTopTabBarProps) {
  return (
    <View style={[styles.bar, { height: sizes.tabBarContent + insets.bottom, paddingBottom: insets.bottom }]}>
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
            <Text variant="tab" style={{ color }}>
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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
