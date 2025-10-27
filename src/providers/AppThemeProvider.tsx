import { ReactNode, useEffect } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

import { resolveTheme, useUIStore } from '@/stores/useUIStore';

type Props = { children: ReactNode };

export function AppThemeProvider({ children }: Props) {
  const themePreference = useUIStore((state) => state.theme);

  const scheme = resolveTheme(themePreference);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (themePreference === 'system' && colorScheme) {
        StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
      }
    });

    return () => listener.remove();
  }, [themePreference]);

  useEffect(() => {
    StatusBar.setBarStyle(scheme === 'dark' ? 'light-content' : 'dark-content');
  }, [scheme]);

  return (
    <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}
