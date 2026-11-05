import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, UserButton } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatLongDate } from '@/shared/lib/date';
import { useProfileStore } from '@/shared/state/profileStore';
import type { Profile } from '@/shared/state/profile';
import { AlarmsOffNotice } from '@/features/alarm/components/AlarmsOffNotice';
import { useNotificationStatus } from '@/features/alarm/useNotificationStatus';
import { HeroBackdrop } from './components/HeroBackdrop';
import { LogPrayerSheet } from './components/LogPrayerSheet';
import { PrayerSheet } from './components/PrayerSheet';
import { TodayHero } from './components/TodayHero';
import type { PrayerName } from './calculate';
import { useSaveChoice } from './data/useSaveChoice';
import { initialChoice, sheetSubtitle } from './logChoice';
import { useTodayPrayers } from './useTodayPrayers';

// Figma "3 · Today": the prayer sheet starts 336 px down a frame whose status bar is 54 px, so 282 px below the status bar.
const HERO_HEIGHT = 282;

export function TodayScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Today profile={profile} /> : null;
}

function Today({ profile }: { profile: Profile }) {
  const { at, dayKey, times, states, window } = useTodayPrayers(profile);
  const [editing, setEditing] = useState<PrayerName | null>(null);
  const saveChoice = useSaveChoice();
  const notifications = useNotificationStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sheetTop = insets.top + HERO_HEIGHT;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <HeroBackdrop sheetTop={sheetTop} safeTop={insets.top} />
      <View style={[styles.header, { top: insets.top + 12 }]}>
        <Text variant="dateLine">{formatLongDate(at)}</Text>
        <Text variant="greeting" color="muted">{`Assalamu alaikum, ${profile.name}`}</Text>
      </View>
      <View style={[styles.user, { top: insets.top + 4 }]}>
        <UserButton />
      </View>
      <TodayHero window={window} at={at} sheetTop={sheetTop} width={width} />
      <PrayerSheet
        top={sheetTop}
        times={times}
        states={states}
        currentName={window.name}
        onMark={(name, choice) => saveChoice(dayKey, name, choice)}
        onEdit={setEditing}
        notice={
          notifications.status === 'denied' ? (
            <View style={styles.notice}>
              <AlarmsOffNotice onFix={notifications.fix} />
            </View>
          ) : null
        }
      />
      {editing ? (
        <LogPrayerSheet
          key={editing}
          prayer={editing}
          subtitle={sheetSubtitle(times[editing], dayKey, dayKey)}
          status={states[editing]}
          initial={initialChoice(states[editing])}
          onSave={(choice) => saveChoice(dayKey, editing, choice)}
          onClear={() => saveChoice(dayKey, editing, 'clear')}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  header: { position: 'absolute', left: 24, gap: 4 },
  user: { position: 'absolute', right: 24 },
  notice: { marginBottom: 4 },
});
