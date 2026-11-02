import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { parseProfile, type Profile } from './profile';

const STORAGE_KEY = 'salah.profile';

interface ProfileState {
  profile: Profile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (profile: Profile) => Promise<void>;
  update: (patch: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ profile: parseProfile(raw), hydrated: true });
  },
  save: async (profile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    set({ profile });
  },
  update: async (patch) => {
    const current = get().profile;
    if (!current) return;
    await get().save({ ...current, ...patch });
  },
}));
