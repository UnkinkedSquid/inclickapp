import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';

import { FancyButton, FormTextField, GlassCard, useToast } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const schema = z
  .object({
    name: z.string().min(2, 'Comparte tu nombre o alias.'),
    email: z.string().email('Necesitamos un correo válido.'),
    password: z
      .string()
      .min(8, 'Usa al menos 8 caracteres con números y letras.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const signUp = useAuthStore((state) => state.signUp);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      resetOnboarding();
      await signUp({ name: name.trim(), email: email.trim(), password });
      showToast('Cuenta creada. Diseñemos tu onboarding ✨', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos registrarte.';
      showToast(message, 'error');
    }
  });

  return (
    <LinearGradient colors={["#F8FAFF", "#E5EEFF", "#D4E2FF"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Inclick</Text>
            <Text style={styles.title}>Diseña tu experiencia de aprendizaje</Text>
            <Text style={styles.subtitle}>
              Registrarte te da acceso a cursos curados y trayectos personalizados según tus metas.
            </Text>
          </View>

          <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Crea tu cuenta Nexus</Text>
              <Text style={styles.cardSubtitle}>
                Te enviaremos un correo de confirmación para validar tu acceso.
              </Text>
            </View>

            <View style={styles.formFields}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormTextField
                    label="Nombre completo"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tu nombre o alias"
                    autoCapitalize="words"
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormTextField
                    label="Correo electrónico"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormTextField
                    label="Contraseña"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Al menos 8 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                  <FormTextField
                    label="Confirmar contraseña"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Repite tu contraseña"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <FancyButton
                onPress={onSubmit}
                disabled={isSubmitting}
                accessibilityLabel="Registrar cuenta"
              >
                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </FancyButton>
            </View>
          </GlassCard>

          <View style={styles.footerPrompt}>
            <Text style={styles.footerText}>¿Ya eres parte de Inclick?</Text>
            <Link href="/login" style={styles.footerLink}>
              Inicia sesión
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 56,
    flexGrow: 1,
    gap: 32,
  },
  hero: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    letterSpacing: 6,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#2563EB',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(15,23,42,0.65)',
  },
  cardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  cardContent: {
    padding: 28,
    gap: 28,
  },
  cardHeader: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(15,23,42,0.6)',
    lineHeight: 20,
  },
  formFields: {
    gap: 18,
  },
  footerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(15,23,42,0.6)',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
});
