# inclickapp

- App móvil creada con Expo Router, NativeWind y TypeScript para conectar con Nexus y Supabase.
- Incluye onboarding multistep, tabs (Inicio, Cursos, Trayecto, Perfil) y estado global con Zustand.
- Integración lista para Supabase Auth, Nexus API (mock con fallback) y persistencia en SecureStore/AsyncStorage.

## Requisitos previos

- Node.js 18+
- pnpm 9+
- Cuenta y proyecto en Supabase + credenciales Nexus API

## Configuración rápida

1. Clona el repo y copia el archivo de variables:
   ```bash
   cp .env.example .env
   ```
   Completa los valores de Supabase y Nexus (`EXPO_PUBLIC_*`, `NEXUS_API_KEY`).
2. Instala dependencias:
   ```bash
   pnpm i
   ```
3. Inicia el proyecto con Expo Go o Dev Client:
   ```bash
   pnpm start
   ```
   - `pnpm android` → build/dev en Android
   - `pnpm ios` → build/dev en iOS (requiere macOS)

## Scripts principales

- `pnpm start` / `pnpm dev`: servidor Metro + Expo.
- `pnpm android` / `pnpm ios`: ejecuta `expo run:*` con telemetry desactivado.
- `pnpm typecheck`: validación TypeScript.
- `pnpm lint`: lint con reglas Expo.

## Arquitectura

- `app/` → rutas Expo Router (auth, onboarding, tabs, cursos).
- `src/components/` → UI reutilizable (GlassCard, CourseCard, FancyButton, Stepper, etc.).
- `src/lib/` → clientes Supabase, Nexus, notificaciones y configuración de entorno.
- `src/stores/` → Zustand stores (`useAuthStore`, `useUIStore`, `useOnboardingStore`).
- `src/types/` → contratos compartidos (Course, PathProgress, UserProfile).

## Integraciones clave

- **Supabase**: login/registro email-password, perfiles, persistencia de sesión (AsyncStorage).
- **Nexus API**: cliente tipado con reintentos exponenciales y fallback mock si no hay endpoint.
- **Onboarding**: 5 pasos animados con moti, guardado en Supabase y estado global.
- **Estilos**: NativeWind + glassmorphism ligero, botones fancy (gradientes), microanimaciones.

## EAS / builds

- `app.config.ts` expone `scheme` (`inclick://`) y `extra` con URLs públicas.
- `eas.json` incluye perfiles `development`, `preview`, `production` listos para `eas build`.
- Define `EAS_PROJECT_ID`, `ANDROID_APPLICATION_ID`, `IOS_BUNDLE_IDENTIFIER` en `.env` antes de compilar.

## Estado y seguridad

- Tokens sensibles en SecureStore, preferencias UI en AsyncStorage.
- Formularios con `react-hook-form` + Zod, feedback mediante toasts locales.
- Guard de navegación: sin onboarding completo no se accede a tabs.

## Próximos pasos sugeridos

- Ajustar colecciones/funciones en Supabase (tabla `profiles`: `full_name`, `interests`, `weekly_goal_minutes`, etc.).
- Conectar Nexus API real y almacenar `NEXUS_API_KEY` en SecureStore al iniciar sesión.
- Revisar estilos en dispositivos físicos usando Expo Go o dev client.
