import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';

import { FancyButton, FormTextField, GlassCard, useToast } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido.'),
  password: z.string().min(6, 'Tu contraseña debe tener al menos 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      await signIn(email.trim(), password);
      showToast('¡Qué gusto verte de nuevo! ✨', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesión.';
      showToast(message, 'error');
    }
  });

  return (
    <LinearGradient colors={["#F8FAFF", "#E2ECFF", "#D3E1FF"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Inclick</Text>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Conecta con tu trayecto personalizado y descubre lo nuevo en Nexus.
            </Text>
          </View>
          <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Inicia sesión</Text>
              <Text style={styles.cardSubtitle}>Usa tu correo y contraseña asociadas a Nexus.</Text>
            </View>

            <View style={styles.formFields}>
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
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    error={errors.password?.message}
                  />
                )}
              />

              <FancyButton onPress={onSubmit} disabled={isSubmitting} accessibilityLabel="Iniciar sesión">
                {isSubmitting ? 'Ingresando…' : 'Entrar a Inclick'}
              </FancyButton>
            </View>
          </GlassCard>

          <View style={styles.footerPrompt}>
            <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
            <Link href="/register" style={styles.footerLink}>
              Crear cuenta
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
    paddingTop: 80,
    paddingBottom: 48,
    flexGrow: 1,
  },
  hero: {
    marginBottom: 40,
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    letterSpacing: 6,
    textTransform: 'uppercase',
    color: '#2563EB',
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(15,23,42,0.65)',
    lineHeight: 22,
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
    marginTop: 32,
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
