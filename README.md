# Ahora o Nunca — TDAH

App de gestión de tareas diseñada específicamente para personas con TDAH.

## Stack
- React Native + Expo
- Supabase (auth + database)
- Zustand (estado global)
- i18next (internacionalización)
- RevenueCat (pagos - pago único 3,99€)

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
```
Rellena con tus keys de Supabase.

### 3. Supabase
- Crea un proyecto en supabase.com
- Ejecuta el schema en `supabase/schema.sql`
- Copia la URL y anon key en `.env`

### 4. Arrancar
```bash
npx expo start
```

## Estructura
```
src/
  screens/       # Pantallas principales
  components/    # Componentes reutilizables
  hooks/         # Custom hooks (useAuth, useTasks, useTheme)
  lib/           # Supabase client, store, theme
  types/         # TypeScript types
  i18n/          # Traducciones (es, eu, ca, gl, en, fr, it, pt, de)
  navigation/    # Configuración de rutas
```

## Idiomas soportados
- Español, Euskera, Catalán, Gallego
- Inglés, Francés, Italiano, Portugués, Alemán

## Modelo de negocio
- Freemium: hasta 5 tareas activas, notificaciones a hora fija
- Premium (3,99€ pago único): tareas ilimitadas, voz, notificaciones inteligentes, 7 días gratis
