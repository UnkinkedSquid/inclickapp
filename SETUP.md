# Configuración Final - Tutor IA

## Pasos Obligatorios para Completar la Configuración

### 1. Crear el Storage Bucket en Supabase

El bucket de almacenamiento es necesario para guardar las imágenes que suben los estudiantes.

**Pasos:**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) y selecciona tu proyecto
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en el botón **New bucket**
4. Configura el bucket con estos valores exactos:
   - **Name**: `homework-images`
   - **Public bucket**: ❌ Dejar desmarcado (debe ser privado)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: Agrega estos tipos:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
5. Haz clic en **Create bucket**

### 2. Configurar la API Key de OpenAI

La aplicación usa GPT-4 Vision para analizar las imágenes. Necesitas configurar tu API key de OpenAI como variable de entorno en Supabase.

**Pasos:**

1. Obtén tu API key desde [OpenAI Platform](https://platform.openai.com/api-keys)
   - Si no tienes cuenta, créala en [platform.openai.com](https://platform.openai.com)
   - Genera una nueva API key (comienza con `sk-`)
   - **⚠️ Copia la key inmediatamente, no se volverá a mostrar**

2. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
3. En el menú lateral, haz clic en **Edge Functions**
4. Haz clic en la pestaña **Settings** o **Configuración**
5. En la sección **Secrets** o **Variables de entorno**, agrega una nueva variable:
   - **Name/Key**: `OPENAI_API_KEY`
   - **Value**: Tu API key completa (ej: `sk-proj-...`)
6. Haz clic en **Add secret** o **Guardar**

### 3. Verificar que Todo Funciona

Una vez completados los pasos anteriores:

1. Los usuarios pueden **registrarse** con email y contraseña
2. Pueden **tomar fotos** o **subir imágenes** desde la galería
3. Las imágenes se guardan automáticamente en Supabase Storage
4. La **IA analiza** las imágenes y genera:
   - ✅ Explicaciones paso a paso
   - ✅ Ejemplos prácticos relacionados
   - ✅ Detección automática de la materia
5. Pueden ver su **historial** completo de consultas
6. Pueden marcar consultas como **favoritas**
7. Pueden **editar su perfil** y ver estadísticas

## Estructura de la Base de Datos

La aplicación ya tiene configuradas estas tablas:

### `profiles`
- Información de usuario extendida
- Se crea automáticamente al registrarse
- Campos: nombre, email, nivel educativo

### `queries`
- Guarda cada consulta del estudiante
- Incluye: imagen, pregunta, respuesta IA, ejemplos, materia
- Permite marcar como favorito

## Tecnologías Utilizadas

- **Frontend**: React Native + Expo (iOS & Android)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **IA**: OpenAI GPT-4 Vision (gpt-4o)
- **Backend**: Supabase Edge Functions

## Comandos Útiles

```bash
# Iniciar desarrollo (preview en web)
npm run dev

# Construir para web
npm run build:web

# Verificar tipos TypeScript
npm run typecheck

# Verificar sintaxis y formato
npm run lint
```

## Notas Importantes

- ✅ La base de datos ya está configurada con todas las tablas y políticas RLS
- ✅ La Edge Function de IA ya está desplegada
- ✅ La autenticación está completamente funcional
- ⚠️ **Debes completar los pasos 1 y 2** para que la app funcione al 100%
- 💡 La IA genera respuestas en español automáticamente
- 💡 Las imágenes son privadas, solo el usuario puede verlas
- 💡 El historial se ordena por fecha (más reciente primero)

## Costos Estimados

- **Supabase**: Plan gratuito suficiente para empezar (500MB storage, 50K usuarios)
- **OpenAI**: ~$0.01 por análisis de imagen con GPT-4 Vision

## Soporte

Si encuentras algún problema:

1. Verifica que el bucket `homework-images` existe y está privado
2. Verifica que la variable `OPENAI_API_KEY` está configurada
3. Revisa los logs de Edge Functions en Supabase Dashboard
4. Asegúrate de tener créditos en tu cuenta de OpenAI

---

**¡La aplicación está completa y lista para usarse!** 🎉

Solo falta completar los 2 pasos de configuración arriba.
