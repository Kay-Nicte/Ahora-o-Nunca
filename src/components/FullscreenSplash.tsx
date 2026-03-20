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
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoExclamation: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 64,
    color: '#1a1e2e',
    lineHeight: 72,
  },
  appName: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 28,
    color: colors.textDark,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 12,
    letterSpacing: 3,
    color: colors.mutedDark,
  },
})
