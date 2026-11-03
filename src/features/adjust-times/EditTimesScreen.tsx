import { useMemo } from 'react';
import { now } from '@/shared/lib/date';
import { useProfileStore } from '@/shared/state/profileStore';
import type { ManualTimes } from '@/shared/state/profile';
import { getAutomaticTimes } from '@/features/prayer-times/calculate';
import { AdjustTimesView } from './AdjustTimesView';

// Saving writes the profile, which re-renders Today and makes the alarm sync rebuild every schedule.
export function EditTimesScreen() {
  const profile = useProfileStore((state) => state.profile);
  const update = useProfileStore((state) => state.update);
  const { latitude, longitude, calculationMethod, asrMethod } = profile ?? {};

  const automatic = useMemo(
    () =>
      latitude !== undefined && longitude !== undefined && calculationMethod && asrMethod
        ? getAutomaticTimes({ latitude, longitude, calculationMethod, asrMethod }, now())
        : null,
    [latitude, longitude, calculationMethod, asrMethod],
  );

  if (!profile || !automatic) return null;
  const change = (manualTimes: ManualTimes) =>
    update({ manualTimes: Object.keys(manualTimes).length > 0 ? manualTimes : undefined });

  return (
    <AdjustTimesView
      variant="settings"
      automatic={automatic}
      manual={profile.manualTimes ?? {}}
      onChange={change}
      city={profile.city}
    />
  );
}
