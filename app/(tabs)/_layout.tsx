import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { BottomTabIcon } from '@/components';
import { resolveTheme, useUIStore } from '@/stores/useUIStore';

export default function TabsLayout() {
  const themePreference = useUIStore((state) => state.theme);
  const theme = resolveTheme(themePreference);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Platform.select({ ios: 24, android: 18 }),
          borderRadius: 28,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.95)',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarActiveTintColor: '#3C6DFC',
        tabBarInactiveTintColor: theme === 'dark' ? '#94A3B8' : '#98A2B3',
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <BottomTabIcon name="inicio" label="Inicio" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cursos"
        options={{
          title: 'Cursos',
          tabBarAccessibilityLabel: 'Cursos',
          tabBarIcon: ({ color, focused }) => (
            <BottomTabIcon name="cursos" label="Cursos" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trayecto"
        options={{
          title: 'Trayecto',
          tabBarAccessibilityLabel: 'Trayecto',
          tabBarIcon: ({ color, focused }) => (
            <BottomTabIcon name="trayecto" label="Trayecto" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <BottomTabIcon name="perfil" label="Perfil" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
