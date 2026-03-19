import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay,
} from 'react-native-reanimated'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'

export default function DoneScreen() {
  const theme = useTheme()
  const t = useT()
  const completedThisWeek = 3 // TODO: fetch from DB

  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 })
    opacity.value = withDelay(200, withSpring(1))
  }, [])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 12 }],
  }))

  const s = doneStyles(theme)

  return (
    <SafeAreaView style={s.container}>
      <Animated.View style={[s.ring, ringStyle]}>
        <Text style={s.ringText}>✓</Text>
      </Animated.View>

      <Animated.View style={[s.textBlock, textStyle]}>
        <Text style={s.big}>
          {t('done.title')}{'\n'}<Text style={s.bigEm}>{t('done.titleEm')}</Text>
        </Text>
        <Text style={s.sub}>{t('done.sub')}</Text>
      </Animated.View>

      <Animated.View style={[s.actions, textStyle]}>
        <TouchableOpacity
          style={s.btn}
          onPress={() => router.replace('/')}
        >
          <Text style={s.btnText}>{t('done.btn')}</Text>
        </TouchableOpacity>
        <Text style={s.streak}>{completedThisWeek} {t('done.streak')}</Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const doneStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    ring: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 3,
      borderColor: theme.accent,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    ringText: { fontSize: 38 },
    textBlock: { alignItems: 'center', marginBottom: spacing.xl },
    big: {
      fontFamily: typography.serif,
      fontSize: 30,
      color: theme.text,
      textAlign: 'center',
      lineHeight: 36,
      marginBottom: spacing.sm,
    },
    bigEm: {
      fontFamily: typography.serifItalic,
      color: theme.dark ? '#6b8ed9' : theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: theme.muted,
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 200,
    },
    actions: { width: '100%', alignItems: 'center' },
    btn: {
      width: '100%',
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    btnText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: '#fff',
    },
    streak: {
      fontFamily: typography.sans,
      fontSize: 10,
      color: theme.muted,
      letterSpacing: 0.8,
      marginTop: 12,
    },
  })
