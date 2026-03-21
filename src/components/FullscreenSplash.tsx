import { View, Text, StyleSheet } from 'react-native'
import { colors, typography } from '../lib/theme'

export function SplashContent() {
  return (
    <View style={styles.container}>
      {/* Logo mark */}
      <View style={styles.logoMark}>
        <Text style={styles.logoExclamation}>!</Text>
      </View>

      {/* App name */}
      <Text style={styles.appName}>Ahora o Nunca</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>UNA TAREA. LA QUE TOCA.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
  },
  logoMark: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoExclamation: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 72,
    color: colors.textLight,
    lineHeight: 72,
  },
  appName: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 32,
    color: colors.textDark,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 12,
    letterSpacing: 4,
    color: colors.mutedDark,
  },
})
