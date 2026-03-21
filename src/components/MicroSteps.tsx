import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import { tapSuccess, tapLight } from '../lib/haptics'
import { typography, radius, spacing, colors } from '../lib/theme'

interface MicroStepsProps {
  taskText: string
  onAllDone: () => void
  isPremium: boolean
  onPremiumRequired: () => void
}

// Local fallback decomposition
function localDecompose(text: string): string[] {
  return [
    'Levántate',
    'Ve hacia donde necesitas',
    'Empieza con lo primero que veas',
  ]
}

export function MicroSteps({ taskText, onAllDone, isPremium, onPremiumRequired }: MicroStepsProps) {
  const theme = useTheme()
  const t = useT()
  const language = useAppStore((s) => s.language)
  const [steps, setSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const fetchSteps = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('decompose-task', {
        body: { task: taskText, language },
      })
      if (!error && data?.steps?.length > 0) {
        setSteps(data.steps)
      } else {
        setSteps(localDecompose(taskText))
      }
    } catch {
      setSteps(localDecompose(taskText))
    }
    setLoading(false)
    setStarted(true)
    setCurrentStep(0)
  }

  // Stuck nudge: if no tap for 5 seconds on a step
  const [showStuck, setShowStuck] = useState(false)
  const stuckOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!started) return
    setShowStuck(false)
    stuckOpacity.setValue(0)
    const timer = setTimeout(() => {
      setShowStuck(true)
      Animated.timing(stuckOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentStep, started])

  const handleStepDone = () => {
    tapSuccess()
    setShowStuck(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onAllDone()
    }
  }

  const handlePress = () => {
    if (!isPremium) {
      onPremiumRequired()
      return
    }
    fetchSteps()
  }

  if (!started) {
    return (
      <TouchableOpacity style={[s.helpBtn, { borderColor: 'rgba(255,255,255,0.2)' }]} onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
        ) : (
          <Text style={s.helpBtnText}>{t('task.helpStart')}</Text>
        )}
      </TouchableOpacity>
    )
  }

  if (currentStep >= steps.length) {
    return (
      <View style={s.completeContainer}>
        <Text style={s.completeText}>{t('task.stepsComplete')}</Text>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <Text style={s.stepCounter}>
        {currentStep + 1} / {steps.length}
      </Text>
      <Text style={s.stepText}>{steps[currentStep]}</Text>
      {showStuck && (
        <Animated.View style={{ opacity: stuckOpacity, marginBottom: 8 }}>
          <Text style={s.stuckText}>{t('task.stepStuck')}</Text>
        </Animated.View>
      )}
      <TouchableOpacity style={s.stepBtn} onPress={handleStepDone}>
        <Text style={s.stepBtnText}>{t('task.stepDone')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  helpBtn: {
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  helpBtnText: {
    fontFamily: typography.serifItalic,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  container: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stepCounter: {
    fontFamily: typography.sansBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  stepText: {
    fontFamily: typography.serifItalic,
    fontSize: 22,
    color: colors.white,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  stuckText: {
    fontFamily: typography.serifItalic,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  stepBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  stepBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.white,
  },
  completeContainer: {
    marginTop: spacing.lg,
  },
  completeText: {
    fontFamily: typography.serifItalic,
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
})
