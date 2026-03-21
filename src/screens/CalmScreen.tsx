import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import * as Haptics from 'expo-haptics'
import { typography, radius, spacing, colors } from '../lib/theme'

type CalmMode = 'menu' | 'discharge' | 'grounding' | 'breathe'

const TAP_TARGET = 30

// ============ DISCHARGE ============
function DischargeMode({ onBack }: { onBack: () => void }) {
  const theme = useTheme()
  const t = useT()
  const [tapsLeft, setTapsLeft] = useState(TAP_TARGET)
  const [done, setDone] = useState(false)

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    if (tapsLeft <= 1) {
      setTapsLeft(0)
      setDone(true)
      // Long vibration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
      }, 200)
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
      }, 400)
    } else {
      setTapsLeft(tapsLeft - 1)
    }
  }

  const handleMore = () => {
    setTapsLeft(TAP_TARGET)
    setDone(false)
  }

  if (done) {
    return (
      <View style={s.fullCenter}>
        <Text style={[s.bigText, { color: theme.text }]}>{t('calm.discharge.done')}</Text>
        <View style={s.doneActions}>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.accent }]} onPress={handleMore}>
            <Text style={s.actionBtnText}>{t('calm.discharge.more')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtnOutline} onPress={onBack}>
            <Text style={[s.actionBtnOutlineText, { color: theme.muted }]}>{t('calm.discharge.enough')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <Pressable style={s.fullCenter} onPress={handleTap}>
      <Text style={[s.tapCounter, { color: theme.accent }]}>{tapsLeft}</Text>
      <Text style={[s.tapLabel, { color: theme.muted }]}>{t('calm.discharge.tap')}</Text>
    </Pressable>
  )
}

// ============ GROUNDING 5-4-3-2-1 ============
function GroundingMode({ onBack }: { onBack: () => void }) {
  const theme = useTheme()
  const t = useT()
  const steps = [
    t('calm.ground.see'),
    t('calm.ground.touch'),
    t('calm.ground.hear'),
    t('calm.ground.smell'),
    t('calm.ground.taste'),
  ]
  const [step, setStep] = useState(0)
  const opacity = useRef(new Animated.Value(1)).current

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start()
    if (step < steps.length - 1) {
      setTimeout(() => setStep(step + 1), 150)
    } else {
      setTimeout(() => setStep(999), 150)
    }
  }

  if (step === 999) {
    return (
      <View style={s.fullCenter}>
        <Text style={[s.bigText, { color: theme.accent }]}>{t('calm.ground.done')}</Text>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.accent, marginTop: 24 }]} onPress={onBack}>
          <Text style={s.actionBtnText}>OK</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={s.fullCenter}>
      <Animated.View style={{ opacity }}>
        <Text style={[s.groundText, { color: theme.text }]}>{steps[step]}</Text>
      </Animated.View>
      <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.accent, marginTop: 32 }]} onPress={handleNext}>
        <Text style={s.actionBtnText}>{t('calm.ground.next')}</Text>
      </TouchableOpacity>
    </View>
  )
}

// ============ BREATHE ============
function BreatheMode({ onBack }: { onBack: () => void }) {
  const theme = useTheme()
  const t = useT()
  const scale = useRef(new Animated.Value(0.6)).current
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  useEffect(() => {
    const breathe = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.6, duration: 6000, useNativeDriver: true }),
      ]).start(() => breathe())
    }
    breathe()

    const interval = setInterval(() => {
      setPhase((p) => p === 'in' ? 'out' : 'in')
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Pressable style={s.fullCenter} onPress={onBack}>
      <Animated.View style={[s.breatheCircle, {
        backgroundColor: theme.accent + '30',
        borderColor: theme.accent,
        transform: [{ scale }],
      }]} />
      <Text style={[s.breatheText, { color: theme.text }]}>
        {phase === 'in' ? t('calm.breathe.in') : t('calm.breathe.out')}
      </Text>
    </Pressable>
  )
}

// ============ MAIN SCREEN ============
export default function CalmScreen() {
  const theme = useTheme()
  const t = useT()
  const calmTools = useAppStore((s) => s.calmTools)
  const enabledTools = [
    calmTools.discharge && 'discharge',
    calmTools.grounding && 'grounding',
    calmTools.breathe && 'breathe',
  ].filter(Boolean) as CalmMode[]

  const [mode, setMode] = useState<CalmMode>('menu')

  const s2 = menuStyles(theme)

  const handleBack = () => {
    if (enabledTools.length === 1) {
      router.replace('/')
    } else {
      setMode('menu')
    }
  }

  if (mode === 'discharge') return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <DischargeMode onBack={handleBack} />
    </SafeAreaView>
  )
  if (mode === 'grounding') return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <GroundingMode onBack={handleBack} />
    </SafeAreaView>
  )
  if (mode === 'breathe') return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <BreatheMode onBack={handleBack} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={s2.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={[s2.back, { color: theme.accent }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[s2.title, { color: theme.text }]}>
          {t('calm.title')}{'\n'}<Text style={[s2.titleEm, { color: theme.accent }]}>{t('calm.titleEm')}</Text>
        </Text>
      </View>

      <View style={s2.options}>
        {calmTools.discharge && (
          <TouchableOpacity style={[s2.card, { backgroundColor: theme.surface }]} onPress={() => setMode('discharge')}>
            <Text style={[s2.cardTitle, { color: theme.text }]}>{t('calm.discharge')}</Text>
            <Text style={[s2.cardSub, { color: theme.muted }]}>{t('calm.discharge.sub')}</Text>
          </TouchableOpacity>
        )}

        {calmTools.grounding && (
          <TouchableOpacity style={[s2.card, { backgroundColor: theme.surface }]} onPress={() => setMode('grounding')}>
            <Text style={[s2.cardTitle, { color: theme.text }]}>{t('calm.grounding')}</Text>
            <Text style={[s2.cardSub, { color: theme.muted }]}>{t('calm.grounding.sub')}</Text>
          </TouchableOpacity>
        )}

        {calmTools.breathe && (
          <TouchableOpacity style={[s2.card, { backgroundColor: theme.surface }]} onPress={() => setMode('breathe')}>
            <Text style={[s2.cardTitle, { color: theme.text }]}>{t('calm.breathe')}</Text>
            <Text style={[s2.cardSub, { color: theme.muted }]}>{t('calm.breathe.sub')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  tapCounter: {
    fontFamily: typography.serif,
    fontSize: 80,
    lineHeight: 90,
  },
  tapLabel: {
    fontFamily: typography.sans,
    fontSize: 14,
    marginTop: 8,
  },
  bigText: {
    fontFamily: typography.serifItalic,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 32,
  },
  doneActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionBtn: {
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  actionBtnOutline: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionBtnOutlineText: {
    fontFamily: typography.sans,
    fontSize: 14,
  },
  groundText: {
    fontFamily: typography.serifItalic,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 30,
  },
  breatheCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    marginBottom: 24,
  },
  breatheText: {
    fontFamily: typography.serifItalic,
    fontSize: 20,
  },
})

const menuStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    back: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      marginBottom: 16,
    },
    title: {
      fontFamily: typography.serif,
      fontSize: 26,
      lineHeight: 32,
    },
    titleEm: {
      fontFamily: typography.serifItalic,
    },
    options: {
      paddingHorizontal: 14,
      gap: 14,
    },
    card: {
      borderRadius: radius.md,
      padding: 24,
    },
    cardTitle: {
      fontFamily: typography.serifItalic,
      fontSize: 20,
      marginBottom: 4,
    },
    cardSub: {
      fontFamily: typography.sans,
      fontSize: 13,
    },
  })
