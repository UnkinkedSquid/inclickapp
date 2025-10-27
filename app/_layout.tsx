import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ToastProvider } from '@/components';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { useAuthStore } from '@/stores/useAuthStore';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const status = useAuthStore((state) => state.status);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') {
      return;
    }

    const currentRoot = segments.at(0);

    if (status === 'unauthenticated') {
      const allowedAuthRoutes = new Set([
        '/welcome',
        '/(auth)/welcome',
        '/login',
        '/(auth)/login',
        '/register',
        '/(auth)/register',
      ]);
      if (!allowedAuthRoutes.has(pathname)) {
        router.replace('/welcome');
      }
      return;
    }

    if (status === 'authenticated') {
      if (!onboardingComplete && currentRoot !== 'onboarding') {
        router.replace('/onboarding');
        return;
      }

      if (onboardingComplete && pathname.startsWith('/onboarding')) {
        router.replace('/(tabs)/inicio');
      }
    }
  }, [status, onboardingComplete, segments, pathname, router]);

  if (status === 'idle' || status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#3C6DFC" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <ToastProvider>
            <StatusBar style="auto" />
            <RootLayoutNav />
          </ToastProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
