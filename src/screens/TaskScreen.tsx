import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { CATEGORY_COLORS } from '../types'
import { useT } from '../lib/i18n'
import { useShake } from '../hooks/useShake'
import { spacing, radius, typography } from '../lib/theme'
import { tapSuccess, tapMedium } from '../lib/haptics'

export default function TaskScreen() {
  const theme = useTheme()
  const t = useT()
  const { currentTask, isAltTask, selectedEnergy } = useAppStore()
  const { markComplete, skipAndNext } = useTasks()

  // Timer
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [currentTask?.id])

  // Nudge after 10 seconds of inactivity
  const [showNudge, setShowNudge] = useState(false)
  useEffect(() => {
    setShowNudge(false)
    setSeconds(0)
    const timer = setTimeout(() => setShowNudge(true), 10000)
    return () => clearTimeout(timer)
  }, [currentTask?.id])

  // Nudge fade in
  const nudgeOpacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (showNudge) {
      Animated.timing(nudgeOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start()
    } else {
      nudgeOpacity.setValue(0)
    }
  }, [showNudge])

  const handleDone = useCallback(async () => {
    if (!currentTask) return
    tapSuccess()
    await markComplete(currentTask.id)
    router.push('/done')
  }, [currentTask])

  const handleSkip = useCallback(async () => {
    if (!currentTask) return
    tapMedium()
    await skipAndNext(currentTask.id, selectedEnergy)
    const next = useAppStore.getState().currentTask
    if (!next) router.replace('/')
  }, [currentTask, selectedEnergy])

  // Shake to skip (if enabled)
  const shakeEnabled = useAppStore((s) => s.shakeEnabled)
  useShake(shakeEnabled ? handleSkip : () => {})

  if (!currentTask) {
    return (
      <SafeAreaView style={[emptyStyles.container, { backgroundColor: theme.bg }]}>
        <View style={emptyStyles.content}>
          <View style={[emptyStyles.iconBg, { backgroundColor: theme.surface }]}>
            <Text style={emptyStyles.iconText}>?</Text>
          </View>
          <Text style={[emptyStyles.title, { color: theme.text, fontFamily: typography.serifItalic }]}>
            {t('task.empty.title')}
          </Text>
          <Text style={[emptyStyles.sub, { color: theme.muted }]}>
            {t('task.empty.sub')}
          </Text>
          <TouchableOpacity
            style={[emptyStyles.btn, { backgroundColor: theme.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[emptyStyles.btnText, { color: '#fff' }]}>{t('task.empty.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const minutes = Math.floor(seconds / 60)

  const energyLabels = selectedEnergy
    .map((l) => t(`energy.${l}` as any))
    .join(' · ')

  const s = taskStyles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.top}>
        {isAltTask && (
          <View style={s.altBanner}>
            <Text style={s.altBannerText}>{t('task.alt')}</Text>
          </View>
        )}
        <View style={s.topRow}>
          <View style={s.badge}>
            <Text style={s.badgeText}>{energyLabels} · {t('task.badge.now')}</Text>
          </View>
          {minutes > 0 && (
            <Text style={s.timer}>{minutes} {t('task.timer')}</Text>
          )}
        </View>
        <Text style={s.label}>{t('task.label')}</Text>
        <Text style={s.taskTitle}>{currentTask.text}</Text>
        <View style={s.meta}>
          {currentTask.category && (
            <Text style={[s.metaText, { color: CATEGORY_COLORS[currentTask.category] }]}>
              ● {t(`cat.${currentTask.category}` as any)}
            </Text>
          )}
        </View>

        {/* Nudge */}
        {showNudge && (
          <Animated.View style={[s.nudge, { opacity: nudgeOpacity }]}>
            <Text style={s.nudgeText}>{t('task.nudge')}</Text>
          </Animated.View>
        )}
      </View>

      <View style={s.bottom}>
        <View style={s.actions}>
          <TouchableOpacity style={s.doneBtn} onPress={handleDone}>
            <Text style={s.doneBtnText}>{t('task.done')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={s.skipBtnText}>{t('task.skip')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>{t('task.shake')}</Text>
      </View>
    </SafeAreaView>
  )
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  iconBg: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  iconText: {
    fontFamily: typography.serifItalic,
    fontSize: 36,
    color: '#8890a8',
  },
  title: { fontSize: 22, marginBottom: spacing.sm, textAlign: 'center', lineHeight: 28 },
  sub: { fontSize: 13, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 18 },
  btn: { borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl },
  btnText: { fontFamily: typography.sansBold, fontSize: 16 },
})

const taskStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1e2640' : theme.accent,
      justifyContent: 'space-between',
    },
    top: { padding: spacing.lg, paddingTop: spacing.xxl },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    altBanner: {
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: radius.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    altBannerText: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    },
    badge: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
    },
    badgeText: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.75)',
    },
    timer: {
      fontFamily: typography.serif,
      fontSize: 16,
      color: 'rgba(255,255,255,0.4)',
    },
    label: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: theme.dark ? '#5a6480' : 'rgba(255,255,255,0.6)',
      marginBottom: spacing.sm,
    },
    taskTitle: {
      fontFamily: typography.serifItalic,
      fontSize: 30,
      color: theme.dark ? theme.text : '#fff',
      lineHeight: 35,
      marginBottom: spacing.sm,
    },
    meta: { flexDirection: 'row', gap: spacing.md },
    metaText: {
      fontFamily: typography.sansBold,
      fontSize: 13,
    },
    nudge: {
      marginTop: spacing.xl,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: radius.md,
      padding: spacing.md,
    },
    nudgeText: {
      fontFamily: typography.serifItalic,
      fontSize: 16,
      color: 'rgba(255,255,255,0.6)',
      textAlign: 'center',
    },
    bottom: { padding: 14, paddingBottom: spacing.xl },
    actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    doneBtn: {
      flex: 1,
      backgroundColor: theme.dark ? theme.accent : '#1a1e2e',
      borderRadius: radius.lg,
      padding: 15,
      alignItems: 'center',
    },
    doneBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 15,
      color: '#fff',
    },
    skipBtn: {
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)',
      borderRadius: radius.lg,
      padding: 15,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    skipBtnText: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: theme.dark ? '#8a90a8' : 'rgba(255,255,255,0.8)',
    },
    hint: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: 'rgba(255,255,255,0.3)',
      textAlign: 'center',
    },
  })
