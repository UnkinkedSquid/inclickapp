import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState, FancyButton, GlassCard } from '@/components';
import { getUserPath, listCourses } from '@/lib/nexus';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Course, PathNode, PathProgress } from '@/types';
import { formatCompletion } from '@/utils/format';

const statusCopy: Record<PathNode['status'], { label: string; background: string; text: string }> = {
  locked: {
    label: 'Bloqueado',
    background: 'bg-neutral-200 dark:bg-neutral-800/80',
    text: 'text-neutral-500 dark:text-neutral-300',
  },
  in_progress: {
    label: 'En curso',
    background: 'bg-primary-100 dark:bg-primary-500/20',
    text: 'text-primary-700 dark:text-primary-200',
  },
  done: {
    label: 'Completado',
    background: 'bg-emerald-100 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-200',
  },
};

export default function TrayectoScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<PathProgress | null>(null);
  const [courses, setCourses] = useState<Record<string, Course>>({});

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [pathResponse, courseList] = await Promise.all([
          getUserPath(userId),
          listCourses(),
        ]);
        setPath(pathResponse);
        setCourses(Object.fromEntries(courseList.map((item) => [item.id, item])));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.id]);

  const nextNode = useMemo(() => {
    if (!path) return null;
    return path.nodes.find((node) => node.status === 'in_progress') ?? path.nodes.find((node) => node.status === 'locked');
  }, [path]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FF] dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#3C6DFC" />
      </View>
    );
  }

  if (!path || path.nodes.length === 0) {
    return (
      <View className="flex-1 bg-[#F5F7FF] p-6 dark:bg-neutral-950">
        <EmptyState
          title="Aún no tienes un trayecto"
          description="Elige cursos que te inspiren y arma un roadmap dinámico."
          actionLabel="Descubrir cursos"
          onAction={() => router.push('/(tabs)/cursos')}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F5F7FF] dark:bg-neutral-950" contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
      <GlassCard>
        <View className="gap-4">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white">Tu progreso</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-300">
            {formatCompletion(path.completionPct)} de avance en tu trayecto principal.
          </Text>
          <View className="h-3 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800/80">
            <View
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${Math.min(path.completionPct, 100)}%` }}
            />
          </View>
          {nextNode ? (
            <FancyButton
              accessibilityLabel="Continuar con la siguiente lección"
              onPress={() => router.push({ pathname: '/(tabs)/cursos/[id]', params: { id: nextNode.courseId } })}
            >
              Continuar donde me quedé
            </FancyButton>
          ) : null}
        </View>
      </GlassCard>

      <View className="mt-8 gap-6">
        {path.nodes.map((node, index) => (
          <RoadmapCard
            key={node.id}
            order={index + 1}
            node={node}
            course={courses[node.courseId]}
            onOpen={() => router.push({ pathname: '/(tabs)/cursos/[id]', params: { id: node.courseId } })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function RoadmapCard({
  order,
  node,
  course,
  onOpen,
}: {
  order: number;
  node: PathNode;
  course?: Course;
  onOpen: () => void;
}) {
  return (
    <GlassCard>
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[4px] text-neutral-400 dark:text-neutral-500">
              Paso {order}
            </Text>
            <Text className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
              {course?.title ?? 'Curso en preparación'}
            </Text>
          </View>
          <StatusBadge status={node.status} />
        </View>
        <Text className="text-sm text-neutral-500 dark:text-neutral-300">
          {course?.shortDescription ??
            'Este módulo estará disponible en cuanto habilitemos nuevos contenidos para ti.'}
        </Text>
        <View className="flex-row gap-3">
          <Badge label={`${course?.lessons ?? 0} lecciones`} />
          <Badge label={formatCompletion(node.status === 'done' ? 100 : node.status === 'in_progress' ? 45 : 0)} />
        </View>
        <FancyButton onPress={onOpen} accessibilityLabel="Ver detalle del curso">
          Revisar curso
        </FancyButton>
      </View>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status: PathNode['status'] }) {
  const { label, background, text } = statusCopy[status];
  return (
    <View className={`rounded-full px-3 py-1 ${background}`}>
      <Text className={`text-xs font-semibold uppercase tracking-wide ${text}`}>{label}</Text>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-neutral-200/70 px-3 py-1 dark:bg-neutral-700/70">
      <Text className="text-xs font-semibold text-neutral-600 dark:text-neutral-100">{label}</Text>
    </View>
  );
}
