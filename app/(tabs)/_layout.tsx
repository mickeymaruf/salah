import { TopTabs, type MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { TabBar } from '@/shared/ui';
import { colors } from '@/shared/theme';

// Today and Progress sit in a pager: swipe sideways or tap the bottom bar. Taps switch without animation
// so they feel instant, and the next screen is prepared ahead so a swipe never shows an empty page.
export default function TabsLayout() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: MaterialTopTabBarProps) => <TabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
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
