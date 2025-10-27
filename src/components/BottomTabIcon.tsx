import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import { BookOpenCheck, Home, MapPinned, User2 } from 'lucide-react-native';

type TabKey = 'inicio' | 'cursos' | 'trayecto' | 'perfil';

const ICONS: Record<TabKey, ComponentType<{ color: string; size?: number }>> = {
  inicio: Home,
  cursos: BookOpenCheck,
  trayecto: MapPinned,
  perfil: User2,
};

type BottomTabIconProps = {
  name: TabKey;
  focused: boolean;
  color: string;
  label: string;
};

export function BottomTabIcon({ name, focused, color, label }: BottomTabIconProps) {
  const Icon = ICONS[name];

  return (
    <View className="items-center">
      <View
        className={`mb-1 rounded-full px-3 py-2 ${focused ? 'shadow-sm shadow-primary-500/20' : ''}`}
        style={{
          transform: [{ scale: focused ? 1 : 0.95 }],
          backgroundColor: focused ? 'rgba(60, 109, 252, 0.12)' : 'transparent',
        }}
      >
        <Icon color={color} size={22} />
      </View>
      <Text className={`text-xs font-semibold ${focused ? 'text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500'}`}>
        {label}
      </Text>
    </View>
  );
}
