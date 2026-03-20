import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'

export default function DoneScreen() {
  const theme = useTheme()
  const t = useT()
  const completedThisWeek = 3 // TODO: fetch from DB

  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
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
          {t('done.title')}{'\n'}<Text style={s.bigEm}>{t('done.titleEm')}</Text>
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
