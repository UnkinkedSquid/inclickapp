import { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, Waypoints } from 'lucide-react-native';

import type { Course } from '@/types';
import { AnimatedPressable } from './AnimatedPressable';

type CourseCardProps = {
  course: Course;
  onPress?: () => void;
  onAddToPath?: () => void;
  variant?: 'grid' | 'list';
};

const levelCopy: Record<Course['level'], string> = {
  beginner: 'Nivel principiante',
  intermediate: 'Nivel intermedio',
  advanced: 'Nivel avanzado',
};

export const CourseCard = memo(({ course, onPress, onAddToPath, variant = 'grid' }: CourseCardProps) => {
  const durationHours = Math.round(course.durationMinutes / 60);

  return (
    <AnimatedPressable
      onPress={onPress}
      className={`overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/90 shadow-sm shadow-primary-900/5 dark:border-neutral-700/60 dark:bg-neutral-900/70 ${variant === 'grid' ? 'w-full' : ''}`}
      accessibilityRole="button"
    >
      <View className="h-40 w-full overflow-hidden">
        <Image
          source={{ uri: course.coverUrl ?? 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c' }}
          className="h-full w-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(15,23,42,0.75)"]}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View className="absolute bottom-4 left-4 right-4">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-white/90 px-3 py-1">
              <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                {course.category}
              </Text>
            </View>
            {course.rating ? (
              <View className="flex-row items-center gap-1 rounded-full bg-black/30 px-2 py-1">
                <Star size={14} color="#FACC15" fill="#FACC15" />
                <Text className="text-xs font-semibold text-white">{course.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="space-y-3 p-5">
        <View className="space-y-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-500">
            {levelCopy[course.level]}
          </Text>
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{course.title}</Text>
          {course.shortDescription ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-300" numberOfLines={2}>
              {course.shortDescription}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Clock size={16} color="#3C6DFC" />
            <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">
              {durationHours}h
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Waypoints size={16} color="#3C6DFC" />
            <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">
              {course.lessons} lecciones
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {(course.tags ?? []).slice(0, 3).map((tag) => (
            <View key={tag} className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-500/10">
              <Text className="text-xs font-medium text-primary-600 dark:text-primary-200">{tag}</Text>
            </View>
          ))}
        </View>

        {onAddToPath ? (
          <AnimatedPressable
            onPress={onAddToPath}
            className="mt-1 w-full rounded-full bg-primary-500 py-3"
            accessibilityLabel={`Agregar ${course.title} a mi trayecto`}
          >
            <Text className="text-center font-semibold text-white">Agregar a mi trayecto</Text>
          </AnimatedPressable>
        ) : null}
      </View>
    </AnimatedPressable>
  );
});

CourseCard.displayName = 'CourseCard';
