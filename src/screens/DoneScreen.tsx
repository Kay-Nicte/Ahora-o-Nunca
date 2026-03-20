import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { tapSuccess } from '../lib/haptics'
import { spacing, radius, typography } from '../lib/theme'

const PHRASES_ES = [
  ['Una cosa', 'menos.'],
  ['Hecho.', 'A por otra.'],
  ['Eso era', 'lo difícil.'],
  ['Vas', 'bien.'],
  ['Ya está.', 'Respira.'],
]

const PHRASES_EN = [
  ['One thing', 'less.'],
  ['Done.', 'Next one.'],
  ['That was', 'the hard part.'],
  ['You\'re doing', 'great.'],
  ['It\'s done.', 'Breathe.'],
]

export default function DoneScreen() {
  const theme = useTheme()
  const t = useT()
  const language = useAppStore((s) => s.language)
  const tasks = useAppStore((s) => s.tasks)
  const completedThisWeek = tasks.filter((tk) => {
    if (!tk.completed || !tk.completed_at) return false
    const d = new Date(tk.completed_at)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length

  const phrases = language === 'es' ? PHRASES_ES : PHRASES_EN
  const phrase = phrases[completedThisWeek % phrases.length]

  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    tapSuccess()
    Animated.spring(scale, {
      toValue: 1,
      damping: 12,
      stiffness: 180,
      useNativeDriver: true,
    }).start()

    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start()
  }, [])

  const translateY = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  })

  const s = doneStyles(theme)

  return (
    <SafeAreaView style={s.container}>
      <Animated.View style={[s.ring, { transform: [{ scale }] }]}>
        <Text style={s.ringText}>✓</Text>
      </Animated.View>

      <Animated.View style={[s.textBlock, { opacity, transform: [{ translateY }] }]}>
        <Text style={s.big}>
          {phrase[0]}{'\n'}<Text style={s.bigEm}>{phrase[1]}</Text>
        </Text>
        <Text style={s.sub}>{t('done.sub')}</Text>
      </Animated.View>

      <Animated.View style={[s.actions, { opacity, transform: [{ translateY }] }]}>
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
      color: theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 14,
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
      fontSize: 16,
      color: '#fff',
    },
    streak: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: theme.muted,
      letterSpacing: 0.8,
      marginTop: 12,
    },
  })
