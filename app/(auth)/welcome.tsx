import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

type ArtworkProps = {
  base: [string, string];
  accent: string;
  secondary: string;
  illustration?: any;
};

const createArtworkProps = (props: ArtworkProps) => props;

type Slide = {
  key: string;
  title: string;
  description: string;
  artwork: ReturnType<typeof createArtworkProps>;
};

const HERO_IMAGE = require('../../assets/unamover.png');
const HERO_IMAGE_SECOND = require('../../assets/unamlogin.png');
const HERO_IMAGE_THIRD = require('../../assets/unam2.jpg');

const SLIDES: Slide[] = [
  {
    key: 'routes',
    title: 'Organiza tu aprendizaje sin esfuerzo',
    description:
      'Transforma tus apuntes en planes guiados y enfócate en lo que te acerca a tu meta.',
    artwork: createArtworkProps({
      base: ['#3455FF', '#2336D3'],
      accent: '#FFC857',
      secondary: '#5B8BFF',
      illustration: HERO_IMAGE,
    }),
  },
  {
    key: 'mentor',
    title: 'Tu mentor digital siempre presente',
    description:
      'Recibe recordatorios, desafíos y seguimiento personalizado con Arcadia Mentor.',
    artwork: createArtworkProps({
      base: ['#2E4AF5', '#1D2EC7'],
      accent: '#F97316',
      secondary: '#60A5FA',
      illustration: HERO_IMAGE_SECOND,
    }),
  },
  {
    key: 'community',
    title: 'Avanza con tu comunidad',
    description:
      'Conecta con tu cohorte, comparte avances y suma victorias en equipo.',
    artwork: createArtworkProps({
      base: ['#2B3BFA', '#1825B3'],
      accent: '#38BDF8',
      secondary: '#F472B6',
      illustration: HERO_IMAGE_THIRD,
    }),
  },
];

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const activeSlide = useMemo(() => SLIDES[index], [index]);
  const isLastSlide = index === SLIDES.length - 1;

  const handleMomentumEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const activeIndex = Math.round(contentOffset.x / width);
    setIndex(activeIndex);
  };

  const goNext = () => {
    if (!isLastSlide) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const redirectUri = makeRedirectUri({ scheme: 'inclick' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success') {
          WebBrowser.dismissBrowser();
        }
      }
    } catch (error) {
      console.error('Google sign-in error', error);
      Alert.alert('No se pudo conectar', 'Intenta ingresar con Google nuevamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    Alert.alert('Muy pronto', 'Integración con Apple en camino.');
  };

  return (
    <LinearGradient colors={activeSlide.artwork.base} style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Link href="/login" asChild>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.skipText}>{isLastSlide ? 'Login' : 'Saltar'}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ height: '100%' }}
      >
        {SLIDES.map((slide, slideIndex) => (
          <View key={slide.key} style={[styles.slideWrapper, { width }]}> 
            <ImageBackground
              source={slide.artwork.illustration}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  'rgba(15,23,42,0.35)',
                  'rgba(15,23,42,0.55)',
                  'rgba(15,23,42,0.85)',
                ]}
                locations={[0.1, 0.45, 1]}
                style={[
                  styles.imageOverlay,
                  { paddingBottom: bottom + 48, paddingTop: top + 48 },
                ]}
              >
                <LinearGradient colors={slide.artwork.base} style={styles.tintOverlay} />
                <View style={styles.slideContent}>
                  <View style={styles.copy}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.description}>{slide.description}</Text>
                  </View>

                  {slideIndex !== SLIDES.length - 1 ? (
                    <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={goNext}>
                      <Text style={styles.primaryLabel}>Continuar</Text>
                    </TouchableOpacity>
                  ) : (
                    <FinalCallToAction
                      onGoogle={handleGoogleSignIn}
                      onApple={handleAppleSignIn}
                      loadingGoogle={googleLoading}
                    />
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.dots, { bottom: bottom + 24 }]}>
        {SLIDES.map((slide, slideIndex) => (
          <View
            key={slide.key}
            style={[
              styles.dot,
              slideIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

type FinalCTAProps = {
  onGoogle: () => void | Promise<void>;
  onApple: () => void;
  loadingGoogle: boolean;
};

function FinalCallToAction({ onGoogle, onApple, loadingGoogle }: FinalCTAProps) {
  return (
    <View style={styles.finalActions}>
      <Link href="/register" asChild>
        <TouchableOpacity style={styles.primaryCTAWrapper} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FFFFFF', '#E7EEFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryCTAInner}
          >
            <Text style={styles.primaryCTAText}>Crear cuenta</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Link>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.secondaryCTAWrapper} activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.secondaryCTAInner}
          >
            <Text style={styles.secondaryCTAText}>Ingresar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Link>

      <View style={styles.orSeparator}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>O ingresa con</Text>
        <View style={styles.orLine} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          activeOpacity={0.85}
          onPress={onGoogle}
          disabled={loadingGoogle}
        >
          {loadingGoogle ? <ActivityIndicator color="#1D4ED8" /> : <Text style={styles.socialLabel}>G</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={onApple}>
          <Text style={styles.socialLabel}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
  },
  carousel: {
    flex: 1,
  },
  skipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  slideWrapper: {
    flex: 1,
    height: '100%',
  },
  imageBackground: {
    flex: 1,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 32,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    pointerEvents: 'none',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 24,
  },
  copy: {
    gap: 16,
    maxWidth: 320,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(241,245,249,0.85)',
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    alignSelf: 'stretch',
  },
  primaryLabel: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  finalActions: {
    gap: 16,
    width: '100%',
  },
  primaryCTAWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryCTAInner: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#0F1F4B',
  },
  secondaryCTAWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  secondaryCTAInner: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  fullWidthButton: {
    width: '100%',
  },
  secondaryButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'stretch',
  },
  secondaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  orText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  socialLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  dots: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 26,
    backgroundColor: '#FFFFFF',
  },
});
