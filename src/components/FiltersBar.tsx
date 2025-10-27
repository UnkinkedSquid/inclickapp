import { useMemo } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

import type { Course } from '@/types';
import { Chip } from './Chip';

type FiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory?: string;
  onCategoryChange?: (value?: string) => void;
  selectedLevel?: Course['level'] | 'all';
  onLevelChange?: (value?: Course['level'] | 'all') => void;
};

const levelLabels: Record<Course['level'], string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function FiltersBar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedLevel = 'all',
  onLevelChange,
}: FiltersBarProps) {
  const computedCategories = useMemo(() => ['Todos', ...categories], [categories]);

  return (
    <View className="gap-4">
      <View className="flex-row items-center rounded-full border border-neutral-200 bg-white/90 px-4 py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <Search size={18} color="#667085" />
        <TextInput
          placeholder="Buscar cursos"
          value={search}
          onChangeText={onSearchChange}
          className="ml-3 flex-1 text-base text-neutral-700 dark:text-neutral-100"
          placeholderTextColor="rgba(99, 102, 125, 0.6)"
          returnKeyType="search"
          accessibilityLabel="Buscar cursos"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row items-center gap-2">
          <Chip
            label="Filtros"
            icon={<SlidersHorizontal size={16} color="#3C6DFC" />}
            onPress={() => onLevelChange?.(selectedLevel === 'all' ? 'beginner' : 'all')}
            selected={selectedLevel !== 'all'}
          />
          {computedCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={category === 'Todos' ? !selectedCategory : selectedCategory === category}
              onPress={() =>
                onCategoryChange?.(category === 'Todos' ? undefined : category)
              }
            />
          ))}
          {(['beginner', 'intermediate', 'advanced'] as Course['level'][]).map((level) => (
            <Chip
              key={level}
              label={levelLabels[level]}
              selected={selectedLevel === level}
              onPress={() => onLevelChange?.(selectedLevel === level ? 'all' : level)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
