import { useState } from 'react';
import type { PrayerName } from '@/features/prayer-times/calculate';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { saveProof } from './proofStorage';
import { getVerifier } from './verifier';

export type SubmitResult = { ok: true; label: string } | { ok: false };

export function useProofSubmit(date: string, prayer: PrayerName) {
  const mark = usePrayerLogStore((state) => state.mark);
  const [busy, setBusy] = useState(false);

  const submit = async (photoUri: string): Promise<SubmitResult> => {
    setBusy(true);
    try {
      const result = await getVerifier().verify(photoUri);
      if (!result.ok) return { ok: false };
      await mark(date, prayer, saveProof(date, prayer, photoUri));
      return { ok: true, label: result.label ?? 'Photo taken just now' };
    } catch {
      return { ok: false };
    } finally {
      setBusy(false);
    }
  };

  return { submit, busy };
}
