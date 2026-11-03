import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, RefreshCw } from 'lucide-react-native';
import { Button, Card, Screen, ScreenHeader, Text } from '@/shared/ui';
import { colors, fontFamily, radii, sizes } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import type { ManualTimes } from '@/shared/state/profile';
import { PRAYER_LABELS, PRAYER_NAMES, type DayTimes, type PrayerName } from '@/features/prayer-times/calculate';
import { SettingsGroup } from '@/features/settings/components/SettingsGroup';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { clockOf, clockOnDay, findOrderProblem, hasManualTimes, withClock } from '@/features/prayer-times/manualTimes';
import { TimePickerSheet } from './TimePickerSheet';

interface AdjustTimesViewProps {
  // Onboarding keeps edits until "Save times"; Settings applies each edit as soon as it is made.
  variant: 'onboarding' | 'settings';
  automatic: DayTimes;
  manual: ManualTimes;
  onChange: (manual: ManualTimes) => void;
  // Settings only: the profile's city for the intro line.
  city?: string;
  // Onboarding only.
  onSave?: () => void;
}

const INTRO = 'Based on your location. Tap a time to match your local masjid.';

export function AdjustTimesView({ variant, automatic, manual, onChange, city, onSave }: AdjustTimesViewProps) {
  const [picking, setPicking] = useState<PrayerName | null>(null);
  const settings = variant === 'settings';
  const day = automatic.fajr;
  const effective = (name: PrayerName) => clockOnDay(day, manual[name] ?? clockOf(automatic[name]));

  const apply = (name: PrayerName, clock: string) => {
    const next = withClock(manual, name, clock, automatic);
    const problem = findOrderProblem(automatic, next);
    if (problem) {
      Alert.alert(
        'That time is out of order',
        `${PRAYER_LABELS[problem.later]} must come after ${PRAYER_LABELS[problem.earlier]}. Pick another time.`,
      );
      return;
    }
    onChange(next);
  };

  const reset = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !hasManualTimes(manual) }}
      disabled={!hasManualTimes(manual)}
      onPress={() => onChange({})}
      hitSlop={8}
      style={[styles.reset, !hasManualTimes(manual) && styles.resetOff]}
    >
      <RefreshCw size={16} color={colors.brand.green} strokeWidth={2} />
      <Text variant="rowStrong" color="brand" style={styles.resetLabel}>
        Reset to automatic times
      </Text>
    </Pressable>
  );

  return (
    <Screen style={styles.screen}>
      {settings ? (
        <ScreenHeader title="Edit times" />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.back}
        >
          <ChevronLeft size={24} color={colors.ink.primary} strokeWidth={2} />
        </Pressable>
      )}

      {settings ? (
        <Text variant="row" color="muted" style={styles.settingsIntro}>
          {city ? `Based on your location, ${city}. Tap a time to match your local masjid.` : INTRO}
        </Text>
      ) : (
        <View style={styles.intro}>
          <Text variant="label" color="brand">
            Prayer times
          </Text>
          <Text variant="confirm">{`Adjust your\ntimes`}</Text>
          <Text variant="row" color="muted" style={styles.lead}>
            {INTRO}
          </Text>
        </View>
      )}

      {settings ? (
        <View style={styles.settingsList}>
          <SettingsGroup title="Today’s times">
            {PRAYER_NAMES.map((name) => (
              <SettingsRow
                key={name}
                label={PRAYER_LABELS[name]}
                value={formatTime(effective(name))}
                valueColor="primary"
                onPress={() => setPicking(name)}
              />
            ))}
          </SettingsGroup>
        </View>
      ) : (
        <Card radius={radii.cardSmall} style={styles.card}>
          {PRAYER_NAMES.map((name, index) => {
            const edited = manual[name] !== undefined;
            return (
              <View key={name}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={styles.rowLabel}>
                    {PRAYER_LABELS[name]}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${PRAYER_LABELS[name]}, ${formatTime(effective(name))}${edited ? ', edited' : ''}. Change time`}
                    onPress={() => setPicking(name)}
                    style={[styles.field, (edited || picking === name) && styles.fieldActive]}
                  >
                    <Text variant="rowStrong" color={edited || picking === name ? 'brand' : 'primary'}>
                      {formatTime(effective(name))}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {settings ? null : <View style={styles.resetWrap}>{reset}</View>}
      <View style={styles.spacer} />
      {settings ? reset : <Button label="Save times" onPress={() => onSave?.()} />}

      {picking ? (
        <TimePickerSheet
          title={PRAYER_LABELS[picking]}
          initialClock={manual[picking] ?? clockOf(automatic[picking])}
          onDone={(clock) => apply(picking, clock)}
          onClose={() => setPicking(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 12 },
  back: { width: 32, height: sizes.iconButton, justifyContent: 'center', marginLeft: -4 },
  intro: { marginTop: 20, gap: 8 },
  lead: { marginTop: 2, lineHeight: 22 },
  settingsIntro: { marginTop: 8, lineHeight: 22 },
  settingsList: { marginTop: 20 },
  card: { marginTop: 20 },
  row: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { flex: 1, fontSize: 16 },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: colors.line.soft },
  field: {
    minHeight: sizes.iconButton,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.bg.base,
    backgroundColor: colors.bg.base,
    justifyContent: 'center',
  },
  fieldActive: { backgroundColor: colors.bg.sage, borderColor: colors.brand.green },
  resetWrap: { marginTop: 14, alignItems: 'center' },
  reset: {
    minHeight: sizes.iconButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetOff: { opacity: 0.45 },
  resetLabel: { fontSize: 14, fontFamily: fontFamily.semiBold },
  spacer: { flex: 1 },
});
