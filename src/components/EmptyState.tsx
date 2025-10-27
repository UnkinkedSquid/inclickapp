import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, LinearGradient, Path, Stop } from 'react-native-svg';

import { AnimatedPressable } from './AnimatedPressable';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, illustration }: EmptyStateProps) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-neutral-200/80 bg-neutral-50/60 px-6 py-12 dark:border-neutral-700 dark:bg-neutral-900/50">
      <View className="mb-6" accessible accessibilityRole="image">
        {illustration ?? <EmptyIllustration />}
      </View>
      <Text className="text-center text-lg font-semibold text-neutral-800 dark:text-neutral-100">{title}</Text>
      {description ? (
        <Text className="mt-2 text-center text-base text-neutral-500 dark:text-neutral-300">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <AnimatedPressable
          onPress={onAction}
          className="mt-6 rounded-full bg-primary-500 px-6 py-3"
          accessibilityRole="button"
        >
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

function EmptyIllustration() {
  return (
    <Svg width={120} height={90} viewBox="0 0 120 90">
      <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#8AAEFF" stopOpacity="0.75" />
        <Stop offset="1" stopColor="#3C6DFC" stopOpacity="0.95" />
      </LinearGradient>
      <Circle cx="40" cy="45" r="18" fill="url(#gradient)" opacity={0.9} />
      <Circle cx="80" cy="38" r="12" fill="#EEF5FF" opacity={0.75} />
      <Path
        d="M20 70c10-14 28-22 40-22s30 8 40 22"
        stroke="url(#gradient)"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      <Circle cx="60" cy="70" r="6" fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}
