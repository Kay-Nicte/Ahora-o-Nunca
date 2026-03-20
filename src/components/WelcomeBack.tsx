import React, { useEffect, useState, useRef } from 'react'
import { Text, StyleSheet, Animated } from 'react-native'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { typography, spacing } from '../lib/theme'
import { useTheme } from '../hooks/useTheme'

const ONE_DAY = 24 * 60 * 60 * 1000

export function WelcomeBack() {
  const theme = useTheme()
  const t = useT()
  const lastOpenedAt = useAppStore((s) => s.lastOpenedAt)
  const setLastOpened = useAppStore((s) => s.setLastOpened)
  const [show, setShow] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (lastOpenedAt) {
      const elapsed = Date.now() - new Date(lastOpenedAt).getTime()
      if (elapsed > ONE_DAY) {
        setShow(true)
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.delay(3000),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start(() => setShow(false))
      }
    }
    setLastOpened()
  }, [])

  if (!show) return null

  return (
    <Animated.View style={[s.container, { opacity }]}>
      <Text style={[s.text, { color: theme.accent }]}>{t('welcome.back')}</Text>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontFamily: typography.serifItalic,
    fontSize: 16,
  },
})
