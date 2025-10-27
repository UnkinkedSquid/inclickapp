import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/useAuthStore';

export default function IndexRedirect() {
  const status = useAuthStore((state) => state.status);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (status === 'authenticated') {
    return <Redirect href={onboardingComplete ? '/(tabs)/inicio' : '/onboarding'} />;
  }

  return <Redirect href="/welcome" />;
}
