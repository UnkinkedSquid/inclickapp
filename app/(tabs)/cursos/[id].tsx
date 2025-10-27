import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, Waypoints } from 'lucide-react-native';

import { FancyButton, GlassCard } from '@/components';
import { getCourse } from '@/lib/nexus';
import type { Course } from '@/types';
import { formatMinutes } from '@/utils/format';

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId)
      .then(setCourse)
      .finally(() => setLoading(false));
  }, [courseId]);

  const syllabus = useMemo(() => {
    if (!course) return [] as string[];
    const totalLessons = course.lessons;
    const topics = course.tags ?? ['Introducción', 'Proyecto guiado', 'Evaluación final'];
    return Array.from({ length: Math.min(totalLessons, 8) }).map((_, index) => {
      const topic = topics[index % topics.length];
      return `${index + 1}. ${topic}`;
    });
  }, [course]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FF] dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#3C6DFC" />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FF] dark:bg-neutral-950">
        <Text className="text-base text-neutral-500 dark:text-neutral-300">
          No encontramos la información de este curso.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F5F7FF] dark:bg-neutral-950" contentContainerStyle={{ paddingBottom: 120 }}>
      <LinearGradient
        colors={["rgba(15, 23, 42, 0.4)", "rgba(15, 23, 42, 0.85)"]}
        style={{ height: 320, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={["rgba(60,109,252,0.75)", "rgba(16,24,40,0.85)"]}
          style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, justifyContent: 'flex-end', paddingBottom: 32 }}
        >
          <Text className="text-sm font-semibold uppercase tracking-[4px] text-white/70">
            {course.category}
          </Text>
          <Text className="mt-3 text-3xl font-bold text-white">{course.title}</Text>
          <View className="mt-4 flex-row items-center gap-4">
            <Meta icon={<Clock size={16} color="#fff" />} label={formatMinutes(course.durationMinutes)} />
            <Meta icon={<Waypoints size={16} color="#fff" />} label={`${course.lessons} lecciones`} />
            {course.rating ? (
              <Meta icon={<Star size={16} color="#FACC15" />} label={`${course.rating.toFixed(1)} rating`} />
            ) : null}
          </View>
        </LinearGradient>
      </LinearGradient>

      <View className="mt-8 px-6">
        <GlassCard>
          <View className="gap-4">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
              ¿Qué aprenderás?
            </Text>
            <Text className="text-sm leading-6 text-neutral-500 dark:text-neutral-300">
              {course.shortDescription ??
                'Sumérgete en un programa intensivo que combina teoría, práctica y proyectos reales para dominar las habilidades más demandadas en la industria.'}
            </Text>
          </View>
        </GlassCard>

        <GlassCard className="mt-6">
          <View className="gap-4">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-white">Syllabus destilado</Text>
            <View className="gap-3">
              {syllabus.map((item) => (
                <View
                  key={item}
                  className="flex-row items-start gap-3 rounded-2xl bg-neutral-100/80 px-3 py-3 dark:bg-neutral-800/60"
                >
                  <View className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  <Text className="flex-1 text-sm text-neutral-600 dark:text-neutral-200">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        <FancyButton
          className="mt-8"
          onPress={() => router.push('/(tabs)/trayecto')}
          accessibilityLabel="Agregar curso a mi trayecto"
        >
          Agregar a mi trayecto
        </FancyButton>
      </View>
    </ScrollView>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-white/15 px-3 py-1">
      {icon}
      <Text className="text-xs font-semibold text-white">{label}</Text>
    </View>
  );
}
