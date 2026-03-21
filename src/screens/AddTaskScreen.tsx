import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Modal, Pressable, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useTasks } from '../hooks/useTasks'
import { useAppStore } from '../lib/store'
import { Category, EnergyLevel, CATEGORY_COLORS, ENERGY_SYMBOLS } from '../types'
import { useT } from '../lib/i18n'
import { classifyTask } from '../lib/classify'
import { classifyLocally } from '../lib/classifyLocal'
import { usePremium } from '../hooks/usePremium'
import { spacing, radius, typography } from '../lib/theme'
import { MicIcon } from '../components/Icons'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { AvatarButton } from '../components/AvatarButton'
import { PremiumModal } from '../components/PremiumModal'
import { BottomNav } from '../components/BottomNav'
import { SwipeableScreen } from '../components/SwipeableScreen'
import { TrialBanner } from '../components/TrialBanner'

const CATEGORIES: Category[] = ['home', 'work', 'mobile', 'errands', 'personal']
const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

export default function AddTaskScreen() {
  const theme = useTheme()
  const t = useT()
  const { createTask } = useTasks()
  const { isPremium } = usePremium()

  const tasks = useAppStore((s) => s.tasks)
  const pendingCount = tasks.filter((tk) => !tk.completed).length
  const FREE_LIMIT = 5

  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [energy, setEnergy] = useState<EnergyLevel[]>([])
  const [showPremium, setShowPremium] = useState(false)
  const [showLimit, setShowLimit] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [wasClassified, setWasClassified] = useState(false)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null)
  const [recurrence, setRecurrence] = useState<'daily' | 'weekdays' | 'weekly' | null>(null)
  const [showRecording, setShowRecording] = useState(false)
  const [voiceError, setVoiceError] = useState(false)
  const { recording, processing, startRecording, stopAndTranscribe, cancelRecording } = useVoiceRecorder()

  const handleVoiceStart = async () => {
    if (!isPremium) { setShowPremium(true); return }
    setVoiceError(false)
    const started = await startRecording()
    if (started) setShowRecording(true)
  }

  const handleVoiceStop = async () => {
    const result = await stopAndTranscribe()
    console.log('[AddTask] Voice result:', JSON.stringify(result))
    if (result && result.text) {
      setText(result.text)
      if (result.category) setCategory(result.category)
      if (result.energyLevels.length > 0) setEnergy(result.energyLevels)
      setWasClassified(true)
      setShowRecording(false)
    } else {
      setShowRecording(false)
      setVoiceError(true)
    }
  }

  const handleVoiceCancel = async () => {
    await cancelRecording()
    setShowRecording(false)
  }

  const toggleEnergy = (level: EnergyLevel) => {
    setEnergy((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
    setWasClassified(false)
  }

  const handleTextBlur = useCallback(async () => {
    if (!text.trim() || text.trim().length < 3) return
    setClassifying(true)
    try {
      // Premium: full API classification. Free: local keyword matching only.
      const result = isPremium
        ? await classifyTask(text.trim())
        : classifyLocally(text.trim())
      if (result.category && !category) setCategory(result.category)
      if (result.energyLevels.length > 0 && energy.length === 0) setEnergy(result.energyLevels)
      if (result.estimatedMinutes) setEstimatedMinutes(result.estimatedMinutes)
      if (result.category || result.energyLevels.length > 0) setWasClassified(true)
    } catch (_) {}
    setClassifying(false)
  }, [isPremium, text, category, energy])

  const handleSave = async () => {
    if (!text.trim()) return
    if (!isPremium && pendingCount >= FREE_LIMIT) {
      setShowLimit(true)
      return
    }
    await createTask(text.trim(), energy, category ?? undefined, estimatedMinutes, recurrence)
    setText('')
    setCategory(null)
    setEnergy([])
    setEstimatedMinutes(null)
    setRecurrence(null)
    setWasClassified(false)
    router.back()
  }

  const s = styles(theme)

  return (
    <SwipeableScreen activeTab="add">
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>{t('add.label')}</Text>
              <Text style={s.title}><Text style={s.titleEm}>{t('add.title')}</Text></Text>
            </View>
            <AvatarButton onPress={() => router.push('/profile')} />
          </View>

          <TrialBanner />
          <View style={s.inputArea}>
            {/* Voice button */}
            <TouchableOpacity style={s.voiceBtn} activeOpacity={0.8} onPress={handleVoiceStart}>
              <MicIcon size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={s.voiceHint}>{t('add.speak')}</Text>

            {/* Divider */}
            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[s.dividerText, { color: theme.muted }]}>{t('add.or')}</Text>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Text input */}
            <TextInput
              style={[s.input, {
                backgroundColor: theme.dark ? theme.surface : theme.white,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder={t('add.placeholder')}
              placeholderTextColor={theme.muted}
              value={text}
              onChangeText={(v) => { setText(v); setWasClassified(false) }}
              onBlur={handleTextBlur}
            />

            {/* Classifying indicator */}
            {classifying && (
              <View style={s.classifyRow}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={[s.classifyText, { color: theme.muted }]}>{t('add.classifying')}</Text>
              </View>
            )}
            {wasClassified && !classifying && (
              <Text style={[s.classifiedText, { color: theme.accent }]}>{t('add.classified')}</Text>
            )}
          </View>

          {/* Category chips */}
          <Text style={s.sectionLabel}>{t('add.category')}</Text>
          <View style={s.chips}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.chip, { borderColor: theme.border }, isSelected && { borderColor: CATEGORY_COLORS[cat], backgroundColor: CATEGORY_COLORS[cat] + '18' }]}
                  onPress={() => { setCategory(isSelected ? null : cat); setWasClassified(false) }}
                >
                  <Text style={[s.chipText, { color: theme.muted }, isSelected && { color: CATEGORY_COLORS[cat] }]}>
                    ● {t(`cat.${cat}` as any)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Energy chips */}
          <Text style={[s.sectionLabel, { marginTop: 6 }]}>{t('add.energy')}</Text>
          <View style={s.chips}>
            {ENERGY_OPTIONS.map((level) => {
              const isSelected = energy.includes(level)
              return (
                <TouchableOpacity
                  key={level}
                  style={[s.chip, { borderColor: theme.border }, isSelected && s.chipSelected]}
                  onPress={() => toggleEnergy(level)}
                >
                  <Text style={[s.chipText, { color: theme.muted }, isSelected && s.chipTextSelected]}>
                    {t(`energy.${level}` as any)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Recurrence */}
          <Text style={[s.sectionLabel, { marginTop: 6 }]}>{t('add.repeat')}</Text>
          <View style={s.chips}>
            {([null, 'daily', 'weekdays', 'weekly'] as const).map((rec) => {
              const isSelected = recurrence === rec
              const labelKey = rec === null ? 'add.repeat.none' : `add.repeat.${rec}`
              return (
                <TouchableOpacity
                  key={rec || 'none'}
                  style={[s.chip, { borderColor: theme.border }, isSelected && s.chipSelected]}
                  onPress={() => setRecurrence(rec)}
                >
                  <Text style={[s.chipText, { color: theme.muted }, isSelected && s.chipTextSelected]}>
                    {t(labelKey as any)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Save button */}
          <View style={s.saveArea}>
            <TouchableOpacity
              style={[s.saveBtn, !text.trim() && { opacity: 0.4 }]}
              onPress={handleSave}
              disabled={!text.trim()}
            >
              <Text style={s.saveBtnText}>{t('add.save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <PremiumModal
          visible={showPremium}
          onClose={() => setShowPremium(false)}
          feature={t('premium.voice')}
        />
        {/* Recording modal */}
        <Modal visible={showRecording} transparent animationType="fade" onRequestClose={handleVoiceCancel}>
          <Pressable style={s.recBackdrop} onPress={recording ? undefined : handleVoiceCancel}>
            <Pressable style={[s.recCard, { backgroundColor: theme.dark ? theme.surface : theme.white }]} onPress={(e) => e.stopPropagation()}>
              {processing ? (
                <>
                  <ActivityIndicator size="large" color={theme.accent} style={{ marginBottom: 16 }} />
                  <Text style={[s.recTitle, { color: theme.text }]}>{t('add.processing')}</Text>
                </>
              ) : (
                <>
                  <View style={[s.recPulse, { backgroundColor: '#e05555' }]}>
                    <MicIcon size={32} color="#fff" />
                  </View>
                  <Text style={[s.recTitle, { color: theme.text }]}>{t('add.recording')}</Text>
                  <Text style={[s.recSub, { color: theme.muted }]}>{t('add.tapToStop')}</Text>
                  <TouchableOpacity style={[s.recStopBtn, { backgroundColor: theme.accent }]} onPress={handleVoiceStop}>
                    <Text style={s.recStopText}>⏹</Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Voice error */}
        {voiceError && (
          <View style={s.voiceErrorRow}>
            <Text style={[s.voiceErrorText, { color: theme.muted }]}>{t('add.voiceError')}</Text>
          </View>
        )}

        <PremiumModal
          visible={showLimit}
          onClose={() => setShowLimit(false)}
          feature={t('limit.feature')}
        />
        <BottomNav active="add" />
      </SafeAreaView>
    </SwipeableScreen>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingBottom: 20 },
    headerRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', paddingHorizontal: 20,
      paddingTop: 8, paddingBottom: 20,
    },
    greeting: {
      fontFamily: typography.serifItalic, fontSize: 14,
      color: theme.muted, marginBottom: 6,
    },
    title: { fontFamily: typography.serif, fontSize: 22, color: theme.text },
    titleEm: { fontFamily: typography.serifItalic },
    inputArea: {
      paddingHorizontal: 20, paddingBottom: 14,
      alignItems: 'center', gap: 10,
    },
    voiceBtn: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: theme.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    voiceHint: { fontFamily: typography.sans, fontSize: 12, color: theme.muted },
    divider: {
      flexDirection: 'row', alignItems: 'center',
      gap: 10, width: '100%', marginVertical: 2,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontFamily: typography.sans, fontSize: 12 },
    input: {
      width: '100%', borderWidth: 1.5, borderRadius: 12,
      padding: 12, paddingHorizontal: 14,
      fontFamily: typography.sans, fontSize: 14,
    },
    classifyRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    classifyText: { fontFamily: typography.sans, fontSize: 13 },
    classifiedText: {
      fontFamily: typography.sansBold, fontSize: 13,
    },
    sectionLabel: {
      fontFamily: typography.sansBold, fontSize: 11,
      letterSpacing: 3, textTransform: 'uppercase',
      color: theme.muted, paddingHorizontal: 20, paddingBottom: 8,
    },
    chips: {
      flexDirection: 'row', flexWrap: 'wrap',
      gap: 6, paddingHorizontal: 20,
    },
    chip: {
      paddingVertical: 5, paddingHorizontal: 12,
      borderRadius: radius.full, borderWidth: 1,
    },
    chipSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '18',
    },
    chipText: { fontFamily: typography.sansBold, fontSize: 12 },
    chipTextSelected: { color: theme.accent },
    saveArea: { paddingHorizontal: 14, paddingTop: 14 },
    saveBtn: {
      backgroundColor: theme.accent, borderRadius: radius.full,
      padding: 14, alignItems: 'center',
    },
    saveBtnText: {
      fontFamily: typography.sansBold, fontSize: 14, color: theme.white,
    },
    // Recording modal
    recBackdrop: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center', alignItems: 'center', padding: 40,
    },
    recCard: {
      width: '100%', borderRadius: 24, padding: 32, alignItems: 'center',
    },
    recPulse: {
      width: 80, height: 80, borderRadius: 40,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    recTitle: {
      fontFamily: typography.serifItalic, fontSize: 20, marginBottom: 6,
    },
    recSub: {
      fontFamily: typography.sans, fontSize: 14, marginBottom: 20,
    },
    recStopBtn: {
      width: 56, height: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center',
    },
    recStopText: { fontSize: 24, color: theme.white },
    voiceErrorRow: {
      paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8,
    },
    voiceErrorText: {
      fontFamily: typography.sans, fontSize: 13, textAlign: 'center',
    },
  })
