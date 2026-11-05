import { TopTabs, type MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { TabBar } from '@/shared/ui';
import { colors } from '@/shared/theme';

// Today and Progress switch with the bottom bar only. Swiping between them is off because sideways swipes
// are used on Progress to change the day. Taps switch without animation so they feel instant.
export default function TabsLayout() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: MaterialTopTabBarProps) => <TabBar {...props} />}
      screenOptions={{
        swipeEnabled: false,
        animationEnabled: false,
        lazy: true,
        lazyPreloadDistance: 1,
        sceneStyle: { backgroundColor: colors.bg.base },
      }}
    >
      <TopTabs.Screen name="today" options={{ title: 'Today' }} />
      <TopTabs.Screen name="progress" options={{ title: 'Progress' }} />
    </TopTabs>
  );
}
