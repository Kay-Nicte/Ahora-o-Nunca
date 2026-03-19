# Plan de implementación v1

## Prioridad 1 — Core loop (hacer la app usable)
1. **Home** — Pulir para que coincida pixel-perfect con mockup
2. **Task** — Ya existe, ajustar estilos
3. **Done** — Ya existe, ajustar estilos
4. **Add Task** — Pantalla nueva: voz + texto + categorías chips

## Prioridad 2 — Entrada de usuario
5. **Onboarding** — 3 slides con paginación
6. **Login / Registro** — Email + password, Google, Apple

## Prioridad 3 — Gestión
7. **Task List** — Lista con checks, categorías, badges
8. **Profile** — Ajustes, premium row, cerrar sesión

## Prioridad 4 — Secundarias
9. **Notifications config** — Toggles + horario
10. **Paywall** — Perks + precio
11. **Avatar selection** — Galería/Cámara + emojis grid

## Decisiones técnicas
- SafeAreaView → SafeAreaProvider de react-native-safe-area-context (deprecado en RN 0.81)
- Navegación: expo-router file-based routing
- Estado: Zustand (ya configurado)
- Backend: Supabase (ya configurado)
- Fuentes: Instrument Serif + Atkinson Hyperlegible (ya cargadas)
- Dark/Light: useTheme hook (ya existe)

## Orden de implementación
Empezar por Prioridad 1, pantalla por pantalla. Cada pantalla se implementa completa antes de pasar a la siguiente.
