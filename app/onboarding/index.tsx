import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedPressable, Chip, FancyButton, GlassCard, Stepper, useToast } from '@/components';
import { requestNotificationPermissions, scheduleWeeklyReminder } from '@/lib/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { UserProfile } from '@/types';

const interestsCatalog = [
  'Frontend',
  'Backend',
  'Inteligencia Artificial',
  'Datos',
  'Product Management',
  'Diseño UI/UX',
  'Marketing',
  'Ciencia',
  'Ciberseguridad',
  'Cloud',
];

const levelOptions: Array<{ value: NonNullable<UserProfile['preferredLevel']>; title: string; description: string }> = [
  {
    value: 'beginner',
    title: 'Estoy iniciando',
    description: 'Construye bases sólidas con ejemplos guiados y práctica supervisada.',
  },
  {
    value: 'intermediate',
    title: 'Tengo experiencia media',
    description: 'Explora retos, proyectos reales y mentoría para seguir avanzando.',
  },
  {
    value: 'advanced',
    title: 'Pro nivel',
    description: 'Profundiza en temas complejos y lidera iniciativas estratégicas.',
  },
];

const themeOptions = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

const totalSteps = 5;

export default function OnboardingFlowScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  const step = useOnboardingStore((state) => state.step);
  const setStep = useOnboardingStore((state) => state.setStep);
  const data = useOnboardingStore((state) => state.data);
  const setData = useOnboardingStore((state) => state.setData);
  const markCompleted = useOnboardingStore((state) => state.markCompleted);

  const setThemePreference = useUIStore((state) => state.setTheme);

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }

    try {
      const id = profile?.id ?? session?.user?.id;
      if (!id) {
        throw new Error('No se encontró el usuario activo.');
      }

      await updateProfile({
        id,
        interests: data.interests,
        preferredLevel: data.preferredLevel,
        theme: data.theme,
        onboardingComplete: true,
        weeklyGoalMinutes: data.weeklyMinutes,
      });

      setThemePreference(data.theme);
      markCompleted();

      const permissions = await requestNotificationPermissions();
      if (permissions.status === 'granted') {
        await scheduleWeeklyReminder(data.weeklyMinutes);
      }

      showToast('¡Listo! Trazo tu trayecto personalizado.', 'success');
      router.replace('/(tabs)/inicio');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos guardar tu progreso.';
      showToast(message, 'error');
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  let progressContent: JSX.Element | null = null;

  switch (step) {
    case 0:
      progressContent = <StepWelcome onNext={handleNext} />;
      break;
    case 1:
      progressContent = (
        <StepInterests
          selected={data.interests}
          onToggle={(interest) => {
            const exists = data.interests.includes(interest);
            setData({
              interests: exists
                ? data.interests.filter((item) => item !== interest)
                : [...data.interests, interest],
            });
          }}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
      break;
    case 2:
      progressContent = (
        <StepLevel
          selected={data.preferredLevel ?? 'beginner'}
          onSelect={(preferredLevel) => setData({ preferredLevel })}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
      break;
    case 3:
      progressContent = (
        <StepPreferences
          theme={data.theme}
          weeklyMinutes={data.weeklyMinutes}
          onChangeTheme={(theme) => setData({ theme })}
          onChangeWeeklyMinutes={(weeklyMinutes) => setData({ weeklyMinutes })}
          onNext={handleNext}
          onBack={handleBack}
        />
      );
      break;
    case 4:
      progressContent = <StepSummary data={data} onBack={handleBack} onConfirm={handleNext} />;
      break;
    default:
      progressContent = null;
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E3EDFF", "#CFE0FF"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepperContainer}>
          <Stepper totalSteps={totalSteps} currentStep={step} />
        </View>

        <View style={styles.cardSpacing} key={step}>
          {progressContent}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <GlassCard containerStyle={styles.cardWrapper} contentStyle={[styles.cardContent, styles.centeredContent]}>
      <LinearGradient
        colors={["#8AAEFF", "#3C6DFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroImage}
      />
      <View style={styles.centerTextBlock}>
        <Text style={styles.cardHeading}>Diseñemos tu experiencia Inclick</Text>
        <Text style={styles.cardBody}>
          Personaliza tu aprendizaje para que Nexus te recomiende cursos, trayectos y retos a tu medida.
        </Text>
      </View>
      <FancyButton onPress={onNext} accessibilityLabel="Comenzar onboarding" style={styles.fullWidthButton}>
        Comenzar
      </FancyButton>
    </GlassCard>
  );
}

function StepInterests({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (interest: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.cardHeading}>¿Qué temas te apasionan?</Text>
        <Text style={[styles.cardBody, styles.cardBodyLeft]}>
          Puedes seleccionar varios; usaremos esto para curar tus recomendaciones.
        </Text>
      </View>
      <View style={styles.chipWrap}>
        {interestsCatalog.map((interest) => (
          <Chip
            key={interest}
            label={interest}
            selected={selected.includes(interest)}
            onPress={() => onToggle(interest)}
          />
        ))}
      </View>
      <ButtonRow onBack={onBack} onNext={onNext} nextLabel="Continuar" />
    </GlassCard>
  );
}

function StepLevel({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: NonNullable<UserProfile['preferredLevel']>;
  onSelect: (level: NonNullable<UserProfile['preferredLevel']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.cardHeading}>¿Cuál es tu nivel actual?</Text>
        <Text style={[styles.cardBody, styles.cardBodyLeft]}>
          Ajustaremos la dificultad de los contenidos y retos a partir de tu respuesta.
        </Text>
      </View>
      <View style={styles.cardList}>
        {levelOptions.map((option) => (
          <FancyCard
            key={option.value}
            active={selected === option.value}
            title={option.title}
            description={option.description}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
      <ButtonRow onBack={onBack} onNext={onNext} nextLabel="Continuar" />
    </GlassCard>
  );
}

function StepPreferences({
  theme,
  weeklyMinutes,
  onChangeTheme,
  onChangeWeeklyMinutes,
  onNext,
  onBack,
}: {
  theme: NonNullable<UserProfile['theme']>;
  weeklyMinutes: number;
  onChangeTheme: (theme: NonNullable<UserProfile['theme']>) => void;
  onChangeWeeklyMinutes: (minutes: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.cardHeading}>Preferencias personales</Text>
        <Text style={[styles.cardBody, styles.cardBodyLeft]}>
          Ajusta la apariencia de la app y cuánto tiempo deseas invertir cada semana.
        </Text>
      </View>

      <View style={styles.preferenceBlock}>
        <Text style={styles.preferenceLabel}>Tema visual</Text>
        <View style={styles.chipWrap}>
          {themeOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={theme === option.value}
              onPress={() => onChangeTheme(option.value as NonNullable<UserProfile['theme']>)}
            />
          ))}
        </View>
      </View>

      <View style={styles.preferenceBlock}>
        <Text style={styles.preferenceLabel}>Meta semanal: {weeklyMinutes} minutos</Text>
        <Slider
          minimumValue={60}
          maximumValue={600}
          step={30}
          value={weeklyMinutes}
          onValueChange={onChangeWeeklyMinutes}
          minimumTrackTintColor="#3C6DFC"
          maximumTrackTintColor="rgba(100,116,139,0.25)"
          thumbTintColor="#3C6DFC"
        />
        <Text style={styles.preferenceHelper}>
          Te enviaremos un suave recordatorio para mantener tu ritmo semanal.
        </Text>
      </View>

      <ButtonRow onBack={onBack} onNext={onNext} nextLabel="Continuar" />
    </GlassCard>
  );
}

function StepSummary({
  data,
  onBack,
  onConfirm,
}: {
  data: ReturnType<typeof useOnboardingStore.getState>['data'];
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <GlassCard containerStyle={styles.cardWrapper} contentStyle={styles.cardContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.cardHeading}>Así luce tu plan inicial</Text>
        <Text style={[styles.cardBody, styles.cardBodyLeft]}>Podrás editarlo desde tu perfil cuando quieras.</Text>
      </View>

      <View style={styles.summaryList}>
        <SummaryRow label="Intereses" value={data.interests.join(', ') || 'Seleccionaremos algunos por ti.'} />
        <SummaryRow label="Nivel" value={levelOptions.find((item) => item.value === data.preferredLevel)?.title ?? 'Principiante'} />
        <SummaryRow label="Tema" value={themeOptions.find((item) => item.value === data.theme)?.label ?? 'Automático'} />
        <SummaryRow label="Meta semanal" value={`${data.weeklyMinutes} min`} />
      </View>

      <ButtonRow onBack={onBack} onNext={onConfirm} nextLabel="Crear mi trayecto" />
    </GlassCard>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ButtonRow({ onBack, onNext, nextLabel }: { onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <View style={styles.buttonRow}>
      <SecondaryButton onPress={onBack} accessibilityLabel="Volver">
        Volver
      </SecondaryButton>
      <FancyButton onPress={onNext} accessibilityLabel={nextLabel} style={styles.flexButton}>
        {nextLabel}
      </FancyButton>
    </View>
  );
}

function SecondaryButton({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.secondaryButton}
    >
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </AnimatedPressable>
  );
}

function FancyCard({ title, description, active, onPress }: { title: string; description: string; active: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: active }}
      style={[styles.fancyCard, active ? styles.fancyCardActive : styles.fancyCardDefault]}
    >
      <Text style={[styles.fancyCardTitle, active ? styles.fancyCardTitleActive : styles.fancyCardTitleDefault]}>
        {title}
      </Text>
      <Text style={styles.fancyCardDescription}>{description}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 48,
    gap: 32,
  },
  stepperContainer: {
    alignItems: 'center',
  },
  cardSpacing: {
    gap: 24,
  },
  cardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  cardContent: {
    padding: 28,
    gap: 24,
  },
  centeredContent: {
    alignItems: 'center',
    gap: 24,
  },
  heroImage: {
    width: '100%',
    height: 160,
    borderRadius: 24,
  },
  centerTextBlock: {
    gap: 8,
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  cardBody: {
    fontSize: 14,
    color: 'rgba(15,23,42,0.65)',
    lineHeight: 20,
    textAlign: 'center',
  },
  cardBodyLeft: {
    textAlign: 'left',
  },
  sectionHeader: {
    gap: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardList: {
    gap: 16,
  },
  preferenceBlock: {
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  preferenceHelper: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryList: {
    gap: 12,
  },
  summaryRow: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.35)',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  fancyCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fancyCardDefault: {
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  fancyCardActive: {
    borderColor: 'rgba(37,99,235,0.45)',
    backgroundColor: 'rgba(219,234,254,0.75)',
  },
  fancyCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fancyCardTitleDefault: {
    color: '#0F172A',
  },
  fancyCardTitleActive: {
    color: '#1D4ED8',
  },
  fancyCardDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(15,23,42,0.65)',
  },
  fullWidthButton: {
    alignSelf: 'stretch',
  },
});
