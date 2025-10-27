import { useEffect } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Chip, FancyButton, FormTextField, GlassCard, useToast } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemePreference, useUIStore } from '@/stores/useUIStore';
import type { UserProfile } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Tu nombre nos ayuda a personalizar la app.'),
  interests: z.array(z.string()).min(1, 'Selecciona al menos un interés.'),
  preferredLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

type ProfileForm = z.infer<typeof schema>;

const availableInterests = [
  'Frontend',
  'Backend',
  'Inteligencia Artificial',
  'Datos',
  'Product Management',
  'Diseño UI/UX',
  'Marketing',
  'Ciberseguridad',
  'Cloud',
];

export default function PerfilScreen() {
  const { showToast } = useToast();

  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);

  const themePreference = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const notificationsEnabled = useUIStore((state) => state.notificationsEnabled);
  const toggleNotifications = useUIStore((state) => state.toggleNotifications);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      interests: profile?.interests ?? ['Frontend'],
      preferredLevel: profile?.preferredLevel ?? 'beginner',
    },
  });

  useEffect(() => {
    reset({
      name: profile?.name ?? '',
      interests: profile?.interests ?? ['Frontend'],
      preferredLevel: profile?.preferredLevel ?? 'beginner',
    });
  }, [profile, reset]);

  const selectedInterests = watch('interests');

  const onSubmit = handleSubmit(async (values) => {
    try {
      const id = profile?.id ?? session?.user?.id;
      if (!id) throw new Error('No pudimos identificar tu perfil.');
      await updateProfile({
        id,
        name: values.name,
        interests: values.interests,
        preferredLevel: values.preferredLevel,
        theme: currentTheme,
      });
      showToast('Perfil actualizado correctamente.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos guardar los cambios.';
      showToast(message, 'error');
    }
  });

  const currentTheme = themePreference;

  return (
    <ScrollView className="flex-1 bg-[#F5F7FF] dark:bg-neutral-950" contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
      <GlassCard>
        <View className="gap-6">
          <View className="flex-row items-center gap-4">
            <Avatar name={profile?.name ?? session?.user?.email ?? 'Usuario'} />
            <View>
              <Text className="text-xl font-semibold text-neutral-900 dark:text-white">
                {profile?.name ?? 'Explorador Inclick'}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-300">{profile?.email ?? session?.user?.email}</Text>
            </View>
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormTextField
                  label="Nombre"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Tu nombre visible"
                  error={errors.name?.message}
                />
              )}
            />

            <View className="gap-3">
              <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Intereses</Text>
              <View className="flex-row flex-wrap gap-2">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <Chip
                      key={interest}
                      label={interest}
                      selected={isSelected}
                      onPress={() => {
                        if (isSelected) {
                          setValue(
                            'interests',
                            selectedInterests.filter((item) => item !== interest),
                            { shouldValidate: true }
                          );
                        } else {
                          setValue('interests', [...selectedInterests, interest], { shouldValidate: true });
                        }
                      }}
                    />
                  );
                })}
              </View>
              {errors.interests?.message ? (
                <Text className="text-xs font-semibold text-rose-500">{errors.interests.message}</Text>
              ) : null}
            </View>

            <View className="gap-3">
              <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">
                Nivel preferido
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(['beginner', 'intermediate', 'advanced'] as ProfileForm['preferredLevel'][]).map((level) => (
                  <Chip
                    key={level}
                    label={levelLabels[level]}
                    selected={watch('preferredLevel') === level}
                    onPress={() => setValue('preferredLevel', level, { shouldValidate: true })}
                  />
                ))}
              </View>
            </View>
          </View>

          <FancyButton onPress={onSubmit} disabled={isSubmitting || !isDirty} accessibilityLabel="Guardar cambios">
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </FancyButton>
        </View>
      </GlassCard>

      <GlassCard className="mt-8">
        <View className="gap-4">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white">Preferencias</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-neutral-600 dark:text-neutral-200">Notificaciones inteligentes</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#CBD5F5', true: '#3C6DFC' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f4f5'}
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Tema</Text>
            <View className="mt-3 flex-row gap-2">
              {themeOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={currentTheme === option.value}
                  onPress={() => setTheme(option.value)}
                />
              ))}
            </View>
          </View>
          <View>
            <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Idioma</Text>
            <Text className="mt-1 rounded-2xl bg-neutral-100/80 px-3 py-2 text-sm text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-300">
              es-MX
            </Text>
          </View>
        </View>
      </GlassCard>

      <FancyButton
        className="mt-8"
        colors={['#F43F5E', '#FB923C']}
        onPress={async () => {
          await signOut();
          showToast('Sesión cerrada.', 'info');
        }}
        accessibilityLabel="Cerrar sesión"
      >
        Cerrar sesión
      </FancyButton>
    </ScrollView>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
  return (
    <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-500/20">
      <Text className="text-xl font-semibold text-primary-600 dark:text-primary-200">{initials || 'IN'}</Text>
    </View>
  );
}

const levelLabels: Record<ProfileForm['preferredLevel'], string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];
