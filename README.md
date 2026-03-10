# PRIME TRACKER - App de entreno gym

App web para llevar el seguimiento de tu rutina de gym. Optimizada para iPhone.

## Tecnologías

- Vite + React + TypeScript
- Tailwind CSS
- Supabase (auth + base de datos)
- PWA (instalable, funciona offline con caché local)

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En el SQL Editor, ejecuta el contenido de `supabase/migrations/001_user_workout_logs.sql`
3. Copia `.env.example` a `.env` y rellena:
   - `VITE_SUPABASE_URL`: URL de tu proyecto
   - `VITE_SUPABASE_ANON_KEY`: clave anónima (Settings > API)

### 3. Sin Supabase

Si no configuras Supabase, la app funcionará solo con IndexedDB (datos en tu dispositivo). Puedes pulsar "Continuar sin cuenta" o "Usar sin cuenta" en la pantalla de login.

## Desarrollo

```bash
npm run dev
```

## Build y producción

```bash
npm run build
npm run preview
```

## Instalar en iPhone

1. Despliega la app (Vercel, Netlify, o servidor estático)
2. Abre la URL en Safari
3. Pulsa el botón "Compartir" y "Añadir a pantalla de inicio"

## Estructura

- `src/lib/routine.ts` - Rutina fija (no modificar)
- `src/lib/supabase.ts` - Cliente Supabase
- `src/hooks/useWorkoutLogs.ts` - Estado de logs + sync Supabase/IndexedDB
- `src/components/` - Header, DaySelector, ExerciseCard, RestTimer, SaveButton, Auth, WorkoutView
