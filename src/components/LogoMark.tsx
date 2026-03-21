// =============================================
// LogoMark.tsx
// =============================================
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../lib/theme'

interface LogoMarkProps {
  size?: number
}

export function LogoMark({ size = 32 }: LogoMarkProps) {
  const borderRadius = size * 0.28
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.text, { fontSize: size * 0.7 }]}>!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    color: colors.textLight,
    lineHeight: undefined,
    includeFontPadding: false,
  },
})
