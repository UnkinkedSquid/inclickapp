import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { UserProfile } from '../types';
import type { ThemePreference } from './useUIStore';

export type OnboardingData = {
  interests: string[];
  preferredLevel: UserProfile['preferredLevel'];
  theme: ThemePreference;
  weeklyMinutes: number;
};

type OnboardingState = {
  step: number;
  completed: boolean;
  data: OnboardingData;
  setStep: (step: number) => void;
  setData: (partial: Partial<OnboardingData>) => void;
  markCompleted: () => void;
  reset: () => void;
};

const initialData = (): OnboardingData => ({
  interests: [],
  preferredLevel: 'beginner',
  theme: 'system',
  weeklyMinutes: 120,
});

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      completed: false,
      data: initialData(),
      setStep: (step) => set({ step }),
      setData: (partial) =>
        set((state) => ({
          data: {
            ...state.data,
            ...partial,
          },
        })),
      markCompleted: () => set({ completed: true }),
      reset: () => set({ step: 0, completed: false, data: initialData() }),
    }),
    {
      name: 'inclick-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
