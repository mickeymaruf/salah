import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { now } from '@/shared/lib/date';
import { DEFAULT_CALCULATION_METHOD, defaultAsrFor } from '@/shared/state/profile';
import { getAutomaticTimes } from '@/features/prayer-times/calculate';
import { useOnboardingDraft } from '@/features/onboarding/draftStore';
import { AdjustTimesView } from './AdjustTimesView';

// Edits stay local until "Save times", so Back discards them and the Location step keeps what it had.
export function OnboardingAdjustScreen() {
  const place = useOnboardingDraft((state) => state.place);
  const saved = useOnboardingDraft((state) => state.manualTimes);
  const setManualTimes = useOnboardingDraft((state) => state.setManualTimes);
  const [manual, setManual] = useState(saved);

  const automatic = useMemo(
    () =>
      place
        ? getAutomaticTimes(
            {
              latitude: place.latitude,
              longitude: place.longitude,
              calculationMethod: DEFAULT_CALCULATION_METHOD,
              asrMethod: defaultAsrFor(place.country),
            },
            now(),
          )
        : null,
    [place],
  );

  if (!automatic) return null;
  return (
    <AdjustTimesView
      variant="onboarding"
      automatic={automatic}
      manual={manual}
      onChange={setManual}
      onSave={() => {
        setManualTimes(manual);
        router.back();
      }}
    />
  );
}
