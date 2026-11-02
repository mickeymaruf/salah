import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { DEFAULT_SETTINGS, parseSettings, type Settings } from './settings';

const STORAGE_KEY = 'salah.settings';

interface SettingsState {
  settings: Settings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ settings: parseSettings(raw), hydrated: true });
  },
  update: async (patch) => {
    const settings = { ...get().settings, ...patch };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },
}));
