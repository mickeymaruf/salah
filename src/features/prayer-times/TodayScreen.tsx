import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, UserButton } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatLongDate, parseDateKey } from '@/shared/lib/date';
import { playPop, preloadPop, useConfetti, type ViewHandle } from '@/shared/feedback';
import { useProfileStore } from '@/shared/state/profileStore';
import type { Profile } from '@/shared/state/profile';
import { AlarmsOffNotice } from '@/features/alarm/components/AlarmsOffNotice';
import { useNotificationStatus } from '@/features/alarm/useNotificationStatus';
import { HeroBackdrop } from './components/HeroBackdrop';
import { CalendarSheet } from './components/CalendarSheet';
import { LogPrayerSheet } from './components/LogPrayerSheet';
import { PrayerSheet } from './components/PrayerSheet';
import { TodayHero } from './components/TodayHero';
import { PRAYER_NAMES, type PrayerName } from './calculate';
import { useSaveChoice } from './data/useSaveChoice';
import { clampDay, dayRange, relativeDayLabel, shiftDayKey } from './dayNav';
import { initialChoice, sheetSubtitle, type LogChoice } from './logChoice';
import { timelineKinds } from './timeline';
import { useTodayView } from './useTodayView';

// Figma "3 · Today": the prayer sheet starts 300 px down a frame whose status bar is 54 px, so 246 px below the status bar.
const HERO_HEIGHT = 246;

export function TodayScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Today profile={profile} /> : null;
}

function Today({ profile }: { profile: Profile }) {
  // The day picked with the arrows. Null follows today, so the screen moves on at midnight by itself.
  const [picked, setPicked] = useState<string | null>(null);
  const { at, todayKey, dayKey, times, states, window, currentName } = useTodayView(profile, picked);
  const [editing, setEditing] = useState<PrayerName | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const saveChoice = useSaveChoice();
  const notifications = useNotificationStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sheetTop = insets.top + HERO_HEIGHT;
  const range = dayRange(todayKey);
  const kinds = timelineKinds(times, at, currentName);

  const pickDay = (key: string) => {
    const day = clampDay(key, range);
    setPicked(day === todayKey ? null : day);
  };
  const go = (days: number) => pickDay(shiftDayKey(dayKey, days));
  const { layer: confetti, burst } = useConfetti();
  useEffect(preloadPop, []);
  // The fifth prayer of the day: this check completes a day on which the other four were already prayed.
  const onPrayed = useCallback(
    (name: PrayerName, from: ViewHandle | null) => {
      const others = PRAYER_NAMES.filter((other) => other !== name);
      burst(from, { big: others.every((other) => states[other] === 'prayed') });
      playPop();
    },
    [burst, states],
  );
  const onMark = useCallback((name: PrayerName, choice: LogChoice) => saveChoice(dayKey, name, choice), [saveChoice, dayKey]);
  const notice =
    notifications.status === 'denied' ? (
      <View style={styles.notice}>
        <AlarmsOffNotice onFix={notifications.fix} />
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <HeroBackdrop sheetTop={sheetTop} safeTop={insets.top} />
      <View style={[styles.header, { top: insets.top + 13 }]}>
        <Text variant="greeting" numberOfLines={1}>{`Assalamu alaikum, ${profile.name}`}</Text>
      </View>
      <View style={[styles.user, { top: insets.top + 4 }]}>
        <UserButton />
      </View>
      <TodayHero window={window} at={at} sheetTop={sheetTop} width={width} />
      <PrayerSheet
        top={sheetTop}
        dayKey={dayKey}
        dateLabel={formatLongDate(parseDateKey(dayKey))}
        dateSub={relativeDayLabel(dayKey, todayKey)}
        canGoBack={dayKey > range.first}
        canGoForward={dayKey < range.last}
        onBack={() => go(-1)}
        onForward={() => go(1)}
        onPickDate={() => setCalendarOpen(true)}
        times={times}
        states={states}
        kinds={kinds}
        currentName={currentName}
        onMark={onMark}
        onPrayed={onPrayed}
        onEdit={setEditing}
        notice={notice}
      />
      {confetti}
      {calendarOpen ? (
        <CalendarSheet shownKey={dayKey} todayKey={todayKey} firstKey={range.first} onSelect={pickDay} onClose={() => setCalendarOpen(false)} />
      ) : null}
      {editing ? (
        <LogPrayerSheet
          key={editing}
          prayer={editing}
          subtitle={sheetSubtitle(times[editing], dayKey, todayKey)}
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
  // The greeting stops short of the user button, which sits 24 px from the right edge.
  header: { position: 'absolute', left: 24, right: 24 + 44 + 8 },
  user: { position: 'absolute', right: 24 },
  notice: { marginHorizontal: 20, marginTop: 4 },
});
