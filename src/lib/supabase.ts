import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session, User } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { env } from './env';
import type { UserProfile } from '../types';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    storageKey: 'inclick-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SessionData = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
};

const PROFILE_TABLE = 'profiles';

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error obteniendo perfil', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapProfileRow(data);
}

export async function updateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  if (!input.id) {
    throw new Error('Se requiere un id de usuario para actualizar el perfil.');
  }

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update({
      full_name: input.name,
      avatar_url: input.avatarUrl,
      interests: input.interests ?? [],
      preferred_level: input.preferredLevel,
      theme: input.theme,
      onboarding_complete: input.onboardingComplete,
      weekly_goal_minutes: input.weeklyGoalMinutes,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando perfil', error);
    throw error;
  }

  return mapProfileRow(data);
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword(email: string, password: string, metadata?: { name?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata?.name,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

function mapProfileRow(row: Record<string, any>): UserProfile {
  return {
    id: row.id,
    name: row.full_name ?? '',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? undefined,
    interests: row.interests ?? [],
    preferredLevel: row.preferred_level ?? undefined,
    theme: row.theme ?? 'system',
    onboardingComplete: Boolean(row.onboarding_complete),
    weeklyGoalMinutes: row.weekly_goal_minutes ?? undefined,
  };
}
