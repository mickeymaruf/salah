import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, ScreenHeader, Toggle } from '@/shared/ui';
import type { AsrMethod, CalculationMethodId, Profile } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { ALARM_SOUNDS, REMINDER_OPTIONS, type AlarmSoundId } from '@/shared/state/settings';
import { useSettingsStore } from '@/shared/state/settingsStore';
import { previewSound } from '@/features/alarm/previewSound';
import { useNotificationStatus } from '@/features/alarm/useNotificationStatus';
import { EditNameSheet } from './components/EditNameSheet';
import { OptionSheet } from './components/OptionSheet';
import { ProfileCard } from './components/ProfileCard';
import { SettingsGroup } from './components/SettingsGroup';
import { SettingsRow } from './components/SettingsRow';
import {
  ALARM_SOUND_LABELS,
  ASR_METHOD_LABELS,
  CALCULATION_METHOD_LABELS,
  formatReminder,
  labelEntries,
} from './options';
import { useRefreshLocation } from './useRefreshLocation';

type Sheet = 'name' | 'method' | 'asr' | 'sound' | 'reminder' | null;

export function SettingsScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Settings profile={profile} /> : null;
}

function Settings({ profile }: { profile: Profile }) {
  const updateProfile = useProfileStore((state) => state.update);
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.update);
  const { refresh, busy } = useRefreshLocation();
  const notifications = useNotificationStatus();
  const [sheet, setSheet] = useState<Sheet>(null);
  const close = () => setSheet(null);

  return (
    <Screen scroll>
      <ScreenHeader title="Settings" />
      <View style={styles.body}>
        <ProfileCard profile={profile} onEdit={() => setSheet('name')} />
        <SettingsGroup title="Prayer times">
          <SettingsRow label="Location" value={busy ? 'Updating…' : profile.city} onPress={refresh} />
          <SettingsRow
            label="Calculation method"
            value={CALCULATION_METHOD_LABELS[profile.calculationMethod]}
            onPress={() => setSheet('method')}
          />
          <SettingsRow
            label="Asr calculation"
            value={ASR_METHOD_LABELS[profile.asrMethod]}
            onPress={() => setSheet('asr')}
          />
        </SettingsGroup>
        <SettingsGroup title="Alarm">
          <SettingsRow
            label="Notifications"
            value={notifications.status === 'denied' ? 'Off' : 'On'}
            onPress={notifications.status === 'denied' ? notifications.fix : () => Linking.openSettings()}
          />
          <SettingsRow
            label="Alarm sound"
            value={ALARM_SOUND_LABELS[settings.alarmSound]}
            onPress={() => setSheet('sound')}
          />
          <SettingsRow
            label="Require photo proof"
            right={
              <Toggle
                accessibilityLabel="Require photo proof"
                value={settings.requireProof}
                onValueChange={(requireProof) => updateSettings({ requireProof })}
              />
            }
          />
          <SettingsRow
            label="Remind me before"
            value={formatReminder(settings.reminderMinutesBefore)}
            onPress={() => setSheet('reminder')}
          />
        </SettingsGroup>
        <SettingsGroup title="About">
          <SettingsRow label="Privacy" onPress={() => router.push('/privacy')} />
          <SettingsRow label="Help & feedback" onPress={() => router.push('/help')} />
        </SettingsGroup>
      </View>

      {sheet === 'name' ? (
        <EditNameSheet initialName={profile.name} onSave={(name) => updateProfile({ name })} onClose={close} />
      ) : null}
      {sheet === 'method' ? (
        <OptionSheet<CalculationMethodId>
          title="Calculation method"
          options={labelEntries(CALCULATION_METHOD_LABELS)}
          selected={profile.calculationMethod}
          onSelect={(calculationMethod) => updateProfile({ calculationMethod })}
          onClose={close}
        />
      ) : null}
      {sheet === 'asr' ? (
        <OptionSheet<AsrMethod>
          title="Asr calculation"
          options={labelEntries(ASR_METHOD_LABELS)}
          selected={profile.asrMethod}
          onSelect={(asrMethod) => updateProfile({ asrMethod })}
          onClose={close}
        />
      ) : null}
      {sheet === 'sound' ? (
        <OptionSheet<AlarmSoundId>
          title="Alarm sound"
          options={ALARM_SOUNDS.map((value) => ({ value, label: ALARM_SOUND_LABELS[value] }))}
          selected={settings.alarmSound}
          onSelect={(alarmSound) => {
            previewSound(alarmSound);
            updateSettings({ alarmSound });
          }}
          onClose={close}
        />
      ) : null}
      {sheet === 'reminder' ? (
        <OptionSheet<number>
          title="Remind me before"
          options={REMINDER_OPTIONS.map((value) => ({ value, label: formatReminder(value) }))}
          selected={settings.reminderMinutesBefore}
          onSelect={(reminderMinutesBefore) => updateSettings({ reminderMinutesBefore })}
          onClose={close}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 16, gap: 18 },
});
