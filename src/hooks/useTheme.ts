import { useColorScheme } from 'react-native'
import { colors } from '../lib/theme'
import { useAppStore } from '../lib/store'

export function useTheme() {
  const systemScheme = useColorScheme()
  const appearanceMode = useAppStore((s) => s.appearanceMode)

  const dark =
    appearanceMode === 'system'
      ? systemScheme === 'dark'
      : appearanceMode === 'dark'

  return {
    dark,
    bg: dark ? colors.bgDark : colors.bgLight,
    surface: dark ? colors.surfaceDark : colors.surfaceLight,
    text: dark ? colors.textDark : colors.textLight,
    muted: dark ? colors.mutedDark : colors.mutedLight,
    border: dark ? colors.borderDark : colors.borderLight,
    accent: dark ? colors.accentDark : colors.accent,
    yellow: colors.yellow,
    error: colors.error,
    white: colors.white,
  }
}
