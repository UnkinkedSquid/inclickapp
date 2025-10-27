import * as SecureStore from 'expo-secure-store';

import type { Course, PathProgress, UserProfile } from '../types';
import { env } from './env';

const DEFAULT_RETRY_ATTEMPTS = 3;
const NEXUS_KEY_STORAGE = 'inclick:nexus-api-key';

type NexusRequestOptions = RequestInit & { retryCount?: number };

const mockCourses: Course[] = [
  {
    id: 'course-frontend-foundations',
    title: 'Frontend moderno con React 19',
    coverUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c',
    category: 'Frontend',
    level: 'beginner',
    lessons: 24,
    durationMinutes: 720,
    rating: 4.8,
    tags: ['React', 'TypeScript', 'UI'],
    shortDescription: 'Aprende a crear interfaces accesibles y fluidas con React 19, TypeScript y NativeWind.',
  },
  {
    id: 'course-ai-product',
    title: 'IA aplicada para product managers',
    coverUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    category: 'Product Management',
    level: 'intermediate',
    lessons: 16,
    durationMinutes: 540,
    rating: 4.6,
    tags: ['AI', 'Product Strategy'],
    shortDescription: 'Descubre cómo integrar modelos generativos en tu roadmap con foco de negocio.',
  },
  {
    id: 'course-data-storytelling',
    title: 'Storytelling con datos',
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    category: 'Datos',
    level: 'advanced',
    lessons: 18,
    durationMinutes: 480,
    rating: 4.9,
    tags: ['Data Viz', 'UX Research'],
    shortDescription: 'Comunica insights complejos con claridad usando dashboards e historias inmersivas.',
  },
];

const mockPath: PathProgress = {
  userId: 'mock-user',
  completionPct: 42,
  nodes: [
    { id: 'node-1', courseId: 'course-frontend-foundations', status: 'in_progress' },
    { id: 'node-2', courseId: 'course-ai-product', status: 'locked' },
    { id: 'node-3', courseId: 'course-data-storytelling', status: 'locked' },
  ],
};

const isMockMode = !env.nexusApiUrl;

export async function setNexusApiKey(value: string) {
  await SecureStore.setItemAsync(NEXUS_KEY_STORAGE, value);
}

export async function getNexusApiKey() {
  const stored = await SecureStore.getItemAsync(NEXUS_KEY_STORAGE);
  return stored ?? null;
}

async function nexusRequest<T>(path: string, options: NexusRequestOptions = {}): Promise<T> {
  if (isMockMode) {
    return mockResolver<T>(path, options);
  }

  const { retryCount = DEFAULT_RETRY_ATTEMPTS, ...init } = options;
  const url = new URL(path, env.nexusApiUrl);

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  };

  const apiKey = await getNexusApiKey();
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (response.status >= 500 && retryCount > 0) {
    const attempt = DEFAULT_RETRY_ATTEMPTS - retryCount + 1;
    const delayMs = 150 * 2 ** attempt;
    await delay(delayMs);
    return nexusRequest<T>(path, { ...options, retryCount: retryCount - 1 });
  }

  if (!response.ok) {
    const errorPayload = await safeJson(response);
    throw new Error(errorPayload?.message ?? `Nexus error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function listCourses(params?: { q?: string; category?: string }): Promise<Course[]> {
  if (isMockMode) {
    const q = params?.q?.toLowerCase().trim();
    const category = params?.category?.toLowerCase().trim();
    return mockCourses.filter((course) => {
      const matchesQuery = q
        ? course.title.toLowerCase().includes(q) ||
          (course.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
        : true;
      const matchesCategory = category ? course.category.toLowerCase() === category : true;
      return matchesQuery && matchesCategory;
    });
  }

  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.category) search.set('category', params.category);

  const suffix = search.toString() ? `/courses?${search.toString()}` : '/courses';
  return nexusRequest<Course[]>(suffix);
}

export async function getCourse(id: string): Promise<Course> {
  if (isMockMode) {
    const course = mockCourses.find((item) => item.id === id);
    if (!course) {
      throw new Error('Curso no encontrado');
    }
    return course;
  }

  return nexusRequest<Course>(`/courses/${id}`);
}

export async function getUserPath(userId: string): Promise<PathProgress> {
  if (isMockMode) {
    return {
      ...mockPath,
      userId,
    };
  }

  return nexusRequest<PathProgress>(`/paths/${userId}`);
}

export async function updateUserProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  if (isMockMode) {
    return {
      ...input,
      id: input.id ?? 'mock-user',
      onboardingComplete: input.onboardingComplete ?? true,
      name: input.name ?? 'Explorer',
      email: input.email ?? 'explorer@example.com',
    } as UserProfile;
  }

  return nexusRequest<UserProfile>('/profiles', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function mockResolver<T>(path: string, _options: NexusRequestOptions): Promise<T> {
  switch (true) {
    case path.startsWith('/courses') && path.includes('?'): {
      const url = new URL(`https://mock${path}`);
      const q = url.searchParams.get('q') ?? undefined;
      const category = url.searchParams.get('category') ?? undefined;
      return (await listCourses({ q, category })) as unknown as T;
    }
    case path === '/courses':
      return mockCourses as unknown as T;
    case /^\/courses\//.test(path):
      return (await getCourse(path.replace('/courses/', ''))) as unknown as T;
    case /^\/paths\//.test(path):
      return (await getUserPath(path.replace('/paths/', ''))) as unknown as T;
    case path === '/profiles':
      return (await updateUserProfile({})) as unknown as T;
    default:
      throw new Error(`Ruta mock no implementada: ${path}`);
  }
}
