import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';

import { AnimatedPressable, CourseCard, EmptyState, FancyButton, GlassCard } from '@/components';
import { listCourses, getUserPath } from '@/lib/nexus';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Course, PathProgress } from '@/types';
import { formatCompletion } from '@/utils/format';

export default function InicioScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [latest, setLatest] = useState<Course[]>([]);
  const [path, setPath] = useState<PathProgress | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [courses, userPath] = await Promise.all([
        listCourses(),
        session?.user ? getUserPath(session.user.id) : Promise.resolve<PathProgress | null>(null),
      ]);

      const userInterests = profile?.interests ?? [];
      const recommendedCourses = userInterests.length
        ? courses.filter((course) =>
            userInterests.some((interest) =>
              course.category.toLowerCase().includes(interest.toLowerCase())
            ) ||
            (course.tags ?? []).some((tag) =>
              userInterests.some((interest) => tag.toLowerCase().includes(interest.toLowerCase()))
            )
          )
        : courses.slice(0, 4);

      setRecommended(recommendedCourses.slice(0, 6));
      setLatest(courses.slice(-6).reverse());
      setPath(userPath);
    } finally {
      setLoading(false);
    }
  }, [profile?.interests, session?.user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push({ pathname: '/(tabs)/cursos', params: { q: search.trim() } });
  };

  const greetingName = profile?.name?.split(' ')[0] ?? 'Explorer';

  return (
    <ScrollView
      className="flex-1 bg-[#F5F7FF] dark:bg-neutral-950"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 52 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="mb-6">
        <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Hola, {greetingName}
        </Text>
        <Text className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
          Listo para seguir aprendiendo
        </Text>
      </View>

      <View className="mb-8 flex-row items-center rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm shadow-black/5 dark:border-neutral-700 dark:bg-neutral-900">
        <Search size={18} color="#64748B" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Busca cursos o habilidades"
          placeholderTextColor="rgba(100,116,139,0.7)"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          className="ml-3 flex-1 text-base text-neutral-800 dark:text-neutral-100"
          accessibilityLabel="Buscar cursos"
        />
        <AnimatedPressable
          onPress={handleSearch}
          className="flex-row items-center gap-2 rounded-full bg-primary-500 px-4 py-2"
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-white">Explorar</Text>
          <ArrowRight size={16} color="#fff" />
        </AnimatedPressable>
      </View>

      <Section
        title="Continuar aprendiendo"
        description="Retoma desde donde te quedaste"
        actionLabel={path ? 'Ver trayecto' : undefined}
        onPressAction={path ? () => router.push('/(tabs)/trayecto') : undefined}
      >
        {loading ? (
          <LoadingState />
        ) : path && path.nodes.length ? (
          <GlassCard>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Tu progreso general
                </Text>
                <Text className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                  {formatCompletion(path.completionPct)} completado
                </Text>
              </View>
              <View className="h-3 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                <View
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${Math.min(path.completionPct, 100)}%` }}
                />
              </View>
              <FancyButton onPress={() => router.push('/(tabs)/trayecto')} accessibilityLabel="Continuar trayecto">
                Continuar trayecto
              </FancyButton>
            </View>
          </GlassCard>
        ) : (
          <EmptyState
            title="Aún no tienes un trayecto activo"
            description="Descubre cursos que se adapten a tus intereses y arma tu roadmap con un clic."
            actionLabel="Explorar cursos"
            onAction={() => router.push('/(tabs)/cursos')}
          />
        )}
      </Section>

      <Section
        title="Recomendados para ti"
        description="Basado en tus intereses e historial"
        actionLabel="Ver todos"
        onPressAction={() => router.push('/(tabs)/cursos')}
      >
        {loading ? (
          <LoadingState />
        ) : recommended.length ? (
          recommended.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => router.push({ pathname: '/(tabs)/cursos/[id]', params: { id: course.id } })}
              onAddToPath={() => router.push('/(tabs)/trayecto')}
              variant="list"
            />
          ))
        ) : (
          <EmptyState
            title="Necesitamos conocerte un poco más"
            description="Completa tu onboarding para sugerirte cursos espectaculares."
            actionLabel="Personalizar"
            onAction={() => router.push('/onboarding')}
          />
        )}
      </Section>

      <Section title="Novedades" description="Cursos recién llegados a Nexus">
        {loading ? (
          <LoadingState />
        ) : latest.length ? (
          latest.map((course) => (
            <CourseCard
              key={`${course.id}-new`}
              course={course}
              onPress={() => router.push({ pathname: '/(tabs)/cursos/[id]', params: { id: course.id } })}
              variant="list"
            />
          ))
        ) : (
          <EmptyState
            title="Sin novedades por ahora"
            description="Activa las notificaciones para enterarte cuando lancemos nuevos cursos."
          />
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  description,
  actionLabel,
  onPressAction,
  children,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-10">
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</Text>
          {description ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-300">{description}</Text>
          ) : null}
        </View>
        {actionLabel && onPressAction ? (
          <AnimatedPressable onPress={onPressAction} accessibilityRole="button">
            <Text className="text-sm font-semibold text-primary-600 dark:text-primary-300">{actionLabel}</Text>
          </AnimatedPressable>
        ) : null}
      </View>
      <View className="gap-4">{children}</View>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white/80 py-12 dark:border-neutral-700 dark:bg-neutral-900/60">
      <ActivityIndicator size="small" color="#3C6DFC" />
      <Text className="mt-3 text-sm text-neutral-500 dark:text-neutral-300">Cargando contenido…</Text>
    </View>
  );
}
