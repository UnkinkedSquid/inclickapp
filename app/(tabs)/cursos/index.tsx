import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedPressable, CourseCard, EmptyState, FiltersBar } from '@/components';
import { listCourses } from '@/lib/nexus';
import type { Course } from '@/types';

const PAGE_SIZE = 6;

export default function CoursesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialQuery = typeof params.q === 'string' ? params.q : '';

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<string | undefined>();
  const [level, setLevel] = useState<Course['level'] | 'all'>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [visible, setVisible] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, search, category, level]);

  useEffect(() => {
    setVisible(filtered.slice(0, PAGE_SIZE * page));
  }, [filtered, page]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => unique.add(course.category));
    return Array.from(unique);
  }, [courses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const list = await listCourses();
      setCourses(list);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const query = search.trim().toLowerCase();
    const next = courses.filter((course) => {
      const matchesQuery = query
        ? course.title.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          (course.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
        : true;
      const matchesCategory = category ? course.category === category : true;
      const matchesLevel = level === 'all' ? true : course.level === level;
      return matchesQuery && matchesCategory && matchesLevel;
    });
    setFiltered(next);
    setPage(1);
    setVisible(next.slice(0, PAGE_SIZE));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleEndReached = () => {
    if (visible.length >= filtered.length) return;
    setPage((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-[#F5F7FF] dark:bg-neutral-950">
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <CourseCard
              course={item}
              onPress={() => router.push({ pathname: '/(tabs)/cursos/[id]', params: { id: item.id } })}
              onAddToPath={() => router.push('/(tabs)/trayecto')}
              variant="list"
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 56, gap: 24 }}>
            <Hero searchCount={filtered.length} onAddToPath={() => router.push('/(tabs)/trayecto')} />
            <FiltersBar
              search={search}
              onSearchChange={setSearch}
              categories={categories}
              selectedCategory={category}
              onCategoryChange={(value) => setCategory(value)}
              selectedLevel={level}
              onLevelChange={(value) => setLevel((value as Course['level']) ?? 'all')}
            />
            <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
              {filtered.length ? `${filtered.length} cursos disponibles` : 'Sin resultados'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-20">
              <ActivityIndicator size="large" color="#3C6DFC" />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              <EmptyState
                title="No encontramos coincidencias"
                description="Prueba con otro término o reinicia los filtros para explorar todo el catálogo."
                actionLabel="Resetear filtros"
                onAction={() => {
                  setSearch('');
                  setCategory(undefined);
                  setLevel('all');
                }}
              />
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.5}
        onEndReached={handleEndReached}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        ListFooterComponent={
          visible.length && visible.length < filtered.length ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#3C6DFC" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

function Hero({ searchCount, onAddToPath }: { searchCount: number; onAddToPath: () => void }) {
  return (
    <LinearGradient
      colors={["#3C6DFC", "#7AA6FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 32, padding: 24 }}
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-white/80">
        Biblioteca Nexus
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">
        Cursos curados por expertos
      </Text>
      <Text className="mt-2 text-base text-white/80">
        {searchCount > 0
          ? `${searchCount} resultados listos para impulsar tu trayecto.`
          : 'Explora las últimas tendencias, microlearning y programas intensivos.'}
      </Text>
      <AnimatedPressable
        onPress={onAddToPath}
        className="mt-6 self-start rounded-full bg-white/20 px-4 py-2"
        accessibilityLabel="Agregar cursos a mi trayecto"
      >
        <Text className="text-sm font-semibold text-white">Agregar a mi trayecto</Text>
      </AnimatedPressable>
    </LinearGradient>
  );
}
