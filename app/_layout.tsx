import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashView } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { useProfileStore } from '@/shared/state/profileStore';
import { useSettingsStore } from '@/shared/state/settingsStore';
import { useTimesSync } from '@/features/prayer-times/data/useTimesSync';
import { useAlarmSync } from '@/features/alarm/useAlarmSync';
import { useNotificationRouting } from '@/features/alarm/useNotificationRouting';
import { useCatchUp } from '@/features/catch-up/useCatchUp';

export { ErrorBoundary } from 'expo-router';

const SPLASH_MIN_MS = 900;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const profile = useProfileStore((state) => state.profile);
  const profileHydrated = useProfileStore((state) => state.hydrated);
  const hydrateProfile = useProfileStore((state) => state.hydrate);
  const settings = useSettingsStore((state) => state.settings);
  const settingsHydrated = useSettingsStore((state) => state.hydrated);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hasProfile = profile !== null;

  useEffect(() => {
    hydrateProfile();
    hydrateSettings();
  }, [hydrateProfile, hydrateSettings]);

  // Keep the branded splash on screen for a moment so it does not flash by on fast launches.
  const [holding, setHolding] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setHolding(false), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const ready = fontsLoaded && profileHydrated && settingsHydrated && !holding;

  useTimesSync(profile);
  useAlarmSync(settingsHydrated ? profile : null, settings);
  useNotificationRouting(ready && hasProfile);
  useCatchUp(profile, ready);

  // The native splash image has no text, so hand over to the in-app splash as soon as fonts exist.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (!ready) {
    return (
      <SafeAreaProvider>
        <SplashView />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!hasProfile}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={hasProfile}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="alarm" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="proof" options={{ gestureEnabled: false }} />
          <Stack.Screen name="verified" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="catch-up" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="edit-times" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="help" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
