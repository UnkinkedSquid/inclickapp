import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Inclick',
  slug: 'inclick',
  version: '1.0.0',
  scheme: 'inclick',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  newArchEnabled: true,
  userInterfaceStyle: 'automatic',
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    nexusApiUrl: process.env.EXPO_PUBLIC_NEXUS_API_URL,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.inclick.app',
  },
  android: {
    package: process.env.ANDROID_APPLICATION_ID ?? 'com.inclick.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#3C6DFC',
      },
    ],
    [
      'expo-secure-store',
      {
        faceIDPermission: 'Permite que Inclick use Face ID para una autenticación más rápida.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: process.env.EXPO_UPDATES_URL,
  },
});
