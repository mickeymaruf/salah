import { create } from 'zustand';
import type { ManualTimes } from '@/shared/state/profile';
import type { DetectedPlace } from '@/features/prayer-times/location';

// Onboarding collects the profile in pieces before it exists. This holds what the Location step
// detected and any hand-set times, so the Adjust times screen can read and write them.
interface OnboardingDraft {
  place: DetectedPlace | null;
  manualTimes: ManualTimes;
  setPlace: (place: DetectedPlace | null) => void;
  setManualTimes: (manualTimes: ManualTimes) => void;
}

export const useOnboardingDraft = create<OnboardingDraft>((set) => ({
  place: null,
  manualTimes: {},
  setPlace: (place) => set({ place }),
  setManualTimes: (manualTimes) => set({ manualTimes }),
}));
