import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

type UIState = {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  language: 'es-MX';
  setTheme: (theme: ThemePreference) => void;
  toggleNotifications: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      notificationsEnabled: true,
      language: 'es-MX',
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    {
      name: 'inclick-ui',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: async (state) => state as UIState,
    }
  )
);

export function resolveTheme(preference: ThemePreference) {
  if (preference === 'system') {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme ?? 'light';
  }
  return preference;
}
