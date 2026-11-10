import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { formatTime, now, parseDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { useSettingsStore } from '@/shared/state/settingsStore';
import { isDateKey, isPrayerName } from '@/features/alarm/notificationData';
import { syncAlarms } from '@/features/alarm/scheduler';
import { getDayTimes, PRAYER_LABELS, type PrayerName } from '@/features/prayer-times/calculate';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { usePrayedOn } from '@/features/prayer-times/data/useDayLog';
import { askKey } from './askPlan';
import { askedLine, nextLine } from './askView';
import { AskView } from './components/AskView';
import { MarkedView } from './components/MarkedView';
import { VerseView } from './components/VerseView';
import { loadMemory, recordAnswer, rememberVerse } from './memoryStorage';
import { pickVerse, type Verse } from './verses';

export function ReminderScreen() {
  const params = useLocalSearchParams<{ prayer?: string; date?: string; first?: string }>();
  const profile = useProfileStore((state) => state.profile);

  if (!profile || !isPrayerName(params.prayer) || !isDateKey(params.date)) return <Redirect href="/today" />;
  return <Reminder profile={profile} prayer={params.prayer} date={params.date} again={params.first !== '1'} />;
}

type Stage = 'ask' | 'verse' | 'marked';

interface ReminderProps {
  profile: Profile;
  prayer: PrayerName;
  date: string;
  again: boolean;
}

function Reminder({ profile, prayer, date, again }: ReminderProps) {
  const settings = useSettingsStore((state) => state.settings);
  const mark = usePrayerLogStore((state) => state.mark);
  const prayed = usePrayedOn(date).has(prayer);
  const [stage, setStage] = useState<Stage>('ask');
  const [verse, setVerse] = useState<Verse | null>(null);

  const timesOf = useCallback((day: Date) => getDayTimes(profile, day), [profile]);
  const day = parseDateKey(date);
  const prayerTime = timesOf(day)[prayer];
  const label = PRAYER_LABELS[prayer];

  // Closing without an answer, or "Not yet": the next ask is 10 minutes from now. Sound never plays.
  const askLater = useCallback(async () => {
    await recordAnswer(askKey(date, prayer));
    await syncAlarms(profile, settings);
  }, [date, prayer, profile, settings]);

  const close = useCallback(() => {
    router.dismissTo('/today');
    askLater().catch(() => undefined);
  }, [askLater]);

  // The Android back button counts as closing.
  useFocusEffect(
    useCallback(() => {
      if (stage === 'marked') return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        close();
        return true;
      });
      return () => sub.remove();
    }, [stage, close]),
  );

  // A notification for a prayer that was marked since: nothing to ask.
  if (prayed && stage !== 'marked') return <Redirect href="/today" />;

  const yes = () => {
    setStage('marked');
    mark(date, prayer, null).catch(() => undefined);
  };

  const notYet = async () => {
    const memory = await loadMemory();
    const next = pickVerse(memory.lastVerseId);
    setVerse(next);
    setStage('verse');
    rememberVerse(next.id).catch(() => undefined);
    askLater().catch(() => undefined);
  };

  if (stage === 'marked') {
    return <MarkedView title={`${label} marked as prayed`} nextLine={nextLine(prayer, day, timesOf)} onDone={() => router.dismissTo('/today')} />;
  }

  if (stage === 'verse' && verse) {
    return <VerseView verse={verse} onPrayNow={() => router.dismissTo('/today')} onClose={() => router.dismissTo('/today')} />;
  }

  return (
    <AskView
      again={again}
      prayerLabel={label}
      timeText={formatTime(prayerTime)}
      askedLine={askedLine(prayerTime, now())}
      onYes={yes}
      onNotYet={notYet}
      onClose={close}
    />
  );
}
