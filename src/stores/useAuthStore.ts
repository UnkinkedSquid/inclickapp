import { create } from 'zustand';

import type { UserProfile } from '../types';
import {
  fetchProfile,
  signInWithPassword,
  signOut as supabaseSignOut,
  signUpWithPassword,
  supabase,
  updateProfile as updateProfileMutation,
} from '../lib/supabase';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
  profile: UserProfile | null;
  onboardingComplete: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: Partial<UserProfile>) => Promise<UserProfile>;
};

let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  session: null,
  profile: null,
  onboardingComplete: false,
  initialize: async () => {
    if (authSubscription) {
      return;
    }
    set({ status: 'loading' });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      set({
        status: 'authenticated',
        session,
        profile,
        onboardingComplete: Boolean(profile?.onboardingComplete),
      });
    } else {
      set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
    }

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (nextSession?.user) {
        const profile = await fetchProfile(nextSession.user.id);
        set({
          status: 'authenticated',
          session: nextSession,
          profile,
          onboardingComplete: Boolean(profile?.onboardingComplete),
        });
      } else {
        set({
          status: 'unauthenticated',
          session: null,
          profile: null,
          onboardingComplete: false,
        });
      }
    });
    authSubscription = data.subscription;
  },
  signIn: async (email, password) => {
    set({ status: 'loading' });
    try {
      const { session } = await signInWithPassword(email, password);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({
          status: 'authenticated',
          session,
          profile,
          onboardingComplete: Boolean(profile?.onboardingComplete),
        });
      } else {
        set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
        throw new Error('Credenciales inválidas.');
      }
    } catch (error) {
      set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
      throw normalizeAuthError(error);
    }
  },
  signUp: async ({ email, password, name }) => {
    set({ status: 'loading' });
    try {
      const { session } = await signUpWithPassword(email, password, { name });
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({
          status: 'authenticated',
          session,
          profile,
          onboardingComplete: Boolean(profile?.onboardingComplete),
        });
      } else {
        set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
      }
    } catch (error) {
      set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
      throw normalizeAuthError(error);
    }
  },
  signOut: async () => {
    await supabaseSignOut();
    set({ status: 'unauthenticated', session: null, profile: null, onboardingComplete: false });
  },
  refreshProfile: async () => {
    const { session } = get();
    if (!session?.user) return;
    const profile = await fetchProfile(session.user.id);
    set({
      profile,
      onboardingComplete: Boolean(profile?.onboardingComplete),
    });
  },
  updateProfile: async (input) => {
    const { profile } = get();
    const base = profile ?? {};
    if (!('id' in base) && !input.id) {
      throw new Error('No hay perfil para actualizar');
    }
    const next = await updateProfileMutation({
      ...(base as Partial<UserProfile>),
      ...input,
    });
    set({
      profile: next,
      onboardingComplete: Boolean(next.onboardingComplete),
    });
    return next;
  },
}));

function normalizeAuthError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('invalid login credentials')) {
      return new Error('Correo o contraseña incorrectos.');
    }
    if (message.includes('email not confirmed')) {
      return new Error('Confirma tu correo antes de iniciar sesión.');
    }
    return error;
  }
  return new Error('Ocurrió un error inesperado. Inténtalo de nuevo.');
}
