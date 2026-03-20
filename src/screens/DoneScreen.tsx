import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { tapSuccess } from '../lib/haptics'
import { getNewUnlocks, getLevel, Reward } from '../lib/rewards'
import { RewardModal } from '../components/RewardModal'
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
  const selectedEnergy = useAppStore((s) => s.selectedEnergy)
  const focusStreak = useAppStore((s) => s.focusStreak)
  const incrementFocusStreak = useAppStore((s) => s.incrementFocusStreak)
  const resetFocusStreak = useAppStore((s) => s.resetFocusStreak)
  const fetchTaskForEnergy = useAppStore((s) => s.fetchTaskForEnergy)
  const totalCompleted = useAppStore((s) => s.totalCompleted)
  const unlockedRewards = useAppStore((s) => s.unlockedRewards)

  // Check for new unlocks
  const [pendingReward, setPendingReward] = useState<Reward | null>(null)
  useEffect(() => {
    const newUnlocks = getNewUnlocks(totalCompleted, unlockedRewards)
    if (newUnlocks.length > 0) {
      // Show the first new unlock, save all
      setPendingReward(newUnlocks[0])
      useAppStore.setState({
        unlockedRewards: [...unlockedRewards, ...newUnlocks.map((r) => r.id)],
      })
    }
  }, [])

  const level = getLevel(totalCompleted)

  const completedThisWeek = tasks.filter((tk) => {
    if (!tk.completed || !tk.completed_at) return false
    const d = new Date(tk.completed_at)
    const now = new Date()
    return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }).length

  const pendingCount = tasks.filter((tk) => !tk.completed).length

  const phrases = language === 'es' ? PHRASES_ES : PHRASES_EN
  const phrase = phrases[completedThisWeek % phrases.length]

  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    tapSuccess()
    incrementFocusStreak()

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

  // Remember last task's category for context switch detection
  const lastCategory = useRef(useAppStore.getState().currentTask?.category).current
  const [showBreather, setShowBreather] = useState(false)

  const handleOneMore = async () => {
    await fetchTaskForEnergy(selectedEnergy)
    const next = useAppStore.getState().currentTask
    if (!next) {
      resetFocusStreak()
      router.replace('/')
      return
    }

    // Detect context switch: different category
    if (lastCategory && next.category && lastCategory !== next.category) {
      setShowBreather(true)
      setTimeout(() => {
        setShowBreather(false)
        router.replace('/task')
      }, 3000)
    } else {
      router.replace('/task')
    }
  }

  const handleDone = () => {
    resetFocusStreak()
    router.replace('/')
  }

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
        {focusStreak > 1 && (
          <Text style={[s.streak, { color: theme.accent }]}>
            {focusStreak} {t('focus.streak')}
          </Text>
        )}
      </Animated.View>

      <Animated.View style={[s.actions, { opacity, transform: [{ translateY }] }]}>
        {/* Focus mode: one more? */}
        {pendingCount > 0 ? (
          <>
            <Text style={[s.oneMoreLabel, { color: theme.muted }]}>{t('focus.oneMore')}</Text>
            <TouchableOpacity style={s.oneMoreBtn} onPress={handleOneMore}>
              <Text style={s.oneMoreBtnText}>{t('focus.yes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.enoughBtn} onPress={handleDone}>
              <Text style={[s.enoughBtnText, { color: theme.muted }]}>{t('focus.no')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={s.oneMoreBtn} onPress={handleDone}>
              <Text style={s.oneMoreBtnText}>{t('done.btn')}</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={s.weekCount}>{completedThisWeek} {t('done.streak')}</Text>
        <Text style={[s.levelText, { color: theme.muted }]}>
          {t('rewards.level')} {level.level} — {language === 'es' ? level.title_es : level.title_en}
        </Text>
      </Animated.View>

      <RewardModal reward={pendingReward} onClose={() => setPendingReward(null)} />

      {/* Context switch breather */}
      {showBreather && (
        <View style={s.breatherOverlay}>
          <Text style={s.breatherTitle}>{t('context.switch')}</Text>
          <Text style={s.breatherSub}>{t('context.breathe')}</Text>
        </View>
      )}
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
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: theme.accent,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    ringText: { fontSize: 44 },
    textBlock: { alignItems: 'center', marginBottom: spacing.xl },
    big: {
      fontFamily: typography.serif,
      fontSize: 34,
      color: theme.text,
      textAlign: 'center',
      lineHeight: 40,
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
    streak: {
      fontFamily: typography.sansBold,
      fontSize: 16,
      marginTop: 12,
    },
    actions: { width: '100%', alignItems: 'center' },
    oneMoreLabel: {
      fontFamily: typography.serifItalic,
      fontSize: 18,
      marginBottom: 12,
    },
    oneMoreBtn: {
      width: '100%',
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    oneMoreBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 16,
      color: '#fff',
    },
    enoughBtn: {
      padding: 10,
    },
    enoughBtnText: {
      fontFamily: typography.sans,
      fontSize: 14,
    },
    weekCount: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: theme.muted,
      letterSpacing: 0.8,
      marginTop: 16,
    },
    levelText: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      letterSpacing: 1,
      marginTop: 8,
    },
    breatherOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.bg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    breatherTitle: {
      fontFamily: typography.serifItalic,
      fontSize: 26,
      color: theme.accent,
      marginBottom: 8,
    },
    breatherSub: {
      fontFamily: typography.sans,
      fontSize: 15,
      color: theme.muted,
    },
  })
