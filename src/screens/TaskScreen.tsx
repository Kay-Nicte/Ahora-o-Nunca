import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Pressable, Share,
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
import { usePremium } from '../hooks/usePremium'
import { MicroSteps } from '../components/MicroSteps'
import { PremiumModal } from '../components/PremiumModal'
import { RemindMe } from '../components/RemindMe'
import { FocusMode } from '../components/FocusMode'

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

  // Reset timer on new task
  useEffect(() => {
    setSeconds(0)
    setShowNudge(false)
  }, [currentTask?.id])

  // Nudge after 5 seconds
  const [showNudge, setShowNudge] = useState(false)
  const nudgeOpacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNudge(true)
      Animated.timing(nudgeOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentTask?.id])

  const incrementSkips = useAppStore((s) => s.incrementSkips)
  const resetSkips = useAppStore((s) => s.resetSkips)
  const consecutiveSkips = useAppStore((s) => s.consecutiveSkips)
  const [showFrustration, setShowFrustration] = useState(false)

  const handleDone = useCallback(async () => {
    if (!currentTask) return
    tapSuccess()
    resetSkips()

    // System tasks: redirect to the right screen
    if (currentTask.id === 'system_create_account') {
      await markComplete(currentTask.id)
      router.replace('/login')
      return
    }
    if (currentTask.id === 'system_pick_avatar') {
      await markComplete(currentTask.id)
      router.replace('/avatar')
      return
    }
    if (currentTask.id === 'system_setup_notifs') {
      await markComplete(currentTask.id)
      router.replace('/notifications')
      return
    }

    await markComplete(currentTask.id)
    router.push('/done')
  }, [currentTask])

  const handleSkip = useCallback(async () => {
    if (!currentTask) return
    tapMedium()
    incrementSkips()
    const newSkips = useAppStore.getState().consecutiveSkips
    if (newSkips >= 3) {
      setShowFrustration(true)
      return
    }
    await skipAndNext(currentTask.id, selectedEnergy)
    const next = useAppStore.getState().currentTask
    if (!next) router.replace('/')
  }, [currentTask, selectedEnergy])

  const handleFrustrationRest = () => {
    resetSkips()
    setShowFrustration(false)
    useAppStore.setState({ currentTask: null })
    router.replace('/')
  }

  const handleFrustrationTry = async () => {
    resetSkips()
    setShowFrustration(false)
    if (!currentTask) return
    await skipAndNext(currentTask.id, selectedEnergy)
    const next = useAppStore.getState().currentTask
    if (!next) router.replace('/')
  }

  // Shake to skip (if enabled)
  const shakeEnabled = useAppStore((s) => s.shakeEnabled)
  useShake(shakeEnabled ? handleSkip : () => {})

  // Premium for micro-steps
  const { isPremium } = usePremium()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

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
          {currentTask.estimated_minutes && (
            <Text style={s.estimate}>
              ~{currentTask.estimated_minutes} {t('task.estimate')}
            </Text>
          )}
        </View>

        {/* Nudge after 5s */}
        {showNudge && (
          <Animated.View style={{ opacity: nudgeOpacity, marginTop: spacing.md }}>
            <Text style={s.nudgeText}>{t('task.nudge')}</Text>
          </Animated.View>
        )}

        {/* Micro-steps: help me start (always visible) */}
        <MicroSteps
          taskText={currentTask.text}
          onAllDone={handleDone}
          isPremium={isPremium}
          onPremiumRequired={() => setShowPremiumModal(true)}
        />

        {/* Action buttons row */}
        <View style={s.taskActions}>
          <TouchableOpacity
            style={[s.focusBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => setFocusMode(true)}
          >
            <Text style={s.focusBtnText}>{t('task.focusMode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.focusBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => {
              const msg = t('task.askHelp.msg').replace('{task}', currentTask.text)
              Share.share({ message: msg })
            }}
          >
            <Text style={s.focusBtnText}>{t('task.askHelp')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature={t('task.helpStart')}
      />

      <View style={s.bottom}>
        <RemindMe visible />
        <View style={[s.actions, { marginTop: spacing.md }]}>
          <TouchableOpacity style={s.doneBtn} onPress={handleDone}>
            <Text style={s.doneBtnText}>{t('task.done')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={s.skipBtnText}>{t('task.skip')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>{t('task.shake')}</Text>
      </View>

      {/* Focus mode */}
      <FocusMode
        visible={focusMode}
        taskText={currentTask.text}
        onDone={() => { setFocusMode(false); handleDone() }}
        onExit={() => setFocusMode(false)}
      />

      {/* Frustration modal */}
      <Modal visible={showFrustration} transparent animationType="fade" onRequestClose={() => setShowFrustration(false)}>
        <Pressable style={s.frustBackdrop}>
          <View style={[s.frustCard, { backgroundColor: theme.dark ? theme.surface : '#fff' }]}>
            <Text style={[s.frustTitle, { color: theme.text }]}>{t('frustration.title')}</Text>
            <Text style={[s.frustSub, { color: theme.muted }]}>{t('frustration.sub')}</Text>
            <View style={s.frustActions}>
              <TouchableOpacity style={[s.frustRestBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleFrustrationRest}>
                <Text style={[s.frustRestText, { color: theme.text }]}>{t('frustration.rest')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.frustTryBtn, { backgroundColor: theme.accent }]} onPress={handleFrustrationTry}>
                <Text style={s.frustTryText}>{t('frustration.try')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
      fontSize: 32,
      color: theme.dark ? theme.text : '#fff',
      lineHeight: 35,
      marginBottom: spacing.sm,
    },
    meta: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    metaText: {
      fontFamily: typography.sansBold,
      fontSize: 13,
    },
    estimate: {
      fontFamily: typography.serif,
      fontSize: 14,
      color: 'rgba(255,255,255,0.4)',
    },
    taskActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: spacing.md,
    },
    focusBtn: {
      borderWidth: 1.5,
      borderRadius: radius.full,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    focusBtnText: {
      fontFamily: typography.serifItalic,
      fontSize: 15,
      color: 'rgba(255,255,255,0.6)',
    },
    nudgeText: {
      fontFamily: typography.serifItalic,
      fontSize: 15,
      color: 'rgba(255,255,255,0.4)',
    },
    bottom: { padding: 14, paddingBottom: spacing.xl },
    actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    doneBtn: {
      flex: 1,
      backgroundColor: theme.dark ? theme.accent : '#1a1e2e',
      borderRadius: radius.lg,
      padding: 18,
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
      padding: 18,
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
    // Frustration modal
    frustBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    frustCard: {
      width: '100%',
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
    },
    frustTitle: {
      fontFamily: typography.serifItalic,
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 8,
    },
    frustSub: {
      fontFamily: typography.sans,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
    },
    frustActions: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    frustRestBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    frustRestText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
    },
    frustTryBtn: {
      flex: 1,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    frustTryText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: '#fff',
    },
  })
