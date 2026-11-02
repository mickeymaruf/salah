import { Tabs } from 'expo-router';
import { ChartColumn, Clock } from 'lucide-react-native';
import { colors, fontFamily, sizes } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg.base },
        tabBarActiveTintColor: colors.brand.green,
        tabBarInactiveTintColor: colors.ink.muted,
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 12 },
        tabBarStyle: {
          height: sizes.tabBarHeight,
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.line.soft,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ color }) => <Clock size={24} color={color} strokeWidth={1.75} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <ChartColumn size={24} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
