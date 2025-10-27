import Constants from 'expo-constants';
import { z } from 'zod';

const extras = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const EnvSchema = z.object({
  supabaseUrl: z
    .string({ required_error: 'EXPO_PUBLIC_SUPABASE_URL no está definida' })
    .min(1, 'EXPO_PUBLIC_SUPABASE_URL no está definida'),
  supabaseAnonKey: z
    .string({ required_error: 'EXPO_PUBLIC_SUPABASE_ANON_KEY no está definida' })
    .min(1, 'EXPO_PUBLIC_SUPABASE_ANON_KEY no está definida'),
  nexusApiUrl: z.string().url().optional(),
});

const raw = {
  supabaseUrl:
    (extras.supabaseUrl as string | undefined) ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '',
  supabaseAnonKey:
    (extras.supabaseAnonKey as string | undefined) ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    '',
  nexusApiUrl:
    (extras.nexusApiUrl as string | undefined) ??
    process.env.EXPO_PUBLIC_NEXUS_API_URL ??
    undefined,
};

const parsed = EnvSchema.safeParse(raw);

if (!parsed.success) {
  console.warn('⚠️ Configuración de entorno faltante:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      supabaseUrl: raw.supabaseUrl,
      supabaseAnonKey: raw.supabaseAnonKey,
      nexusApiUrl: raw.nexusApiUrl,
    };
