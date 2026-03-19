import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { ENERGY_SYMBOLS, CATEGORY_COLORS } from '../types'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'

export default function TaskScreen() {
  const theme = useTheme()
  const t = useT()
  const { currentTask, isAltTask, selectedEnergy } = useAppStore()
  const { markComplete, skipAndNext } = useTasks()

  if (!currentTask) {
    return (
      <SafeAreaView style={[emptyStyles.container, { backgroundColor: theme.bg }]}>
        <View style={emptyStyles.content}>
          <View style={[emptyStyles.iconBg, { backgroundColor: theme.surface }]}>
            <Text style={emptyStyles.emoji}>😮‍💨</Text>
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

  const handleDone = async () => {
    await markComplete(currentTask.id)
    router.push('/done')
  }

  const handleSkip = async () => {
    await skipAndNext(currentTask.id, selectedEnergy)
    // If no more tasks after skip, go home
    const next = useAppStore.getState().currentTask
    if (!next) router.replace('/')
  }

  const energyLabels = selectedEnergy
    .map((l) => t(`energy.${l}` as any))
    .join(' · ')

  const s = taskStyles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.top}>
        {isAltTask && (
          <View style={s.altBanner}>
            <Text style={s.altBannerText}>
              {t('task.alt')}
            </Text>
          </View>
        )}
        <View style={s.badge}>
          <Text style={s.badgeText}>{energyLabels} · {t('task.badge.now')}</Text>
        </View>
        <Text style={s.label}>{t('task.label')}</Text>
        <Text style={s.taskTitle}>{currentTask.text}</Text>
        <View style={s.meta}>
          {currentTask.category && (
            <Text style={s.metaText}>
              ● {t(`cat.${currentTask.category}` as any)}
            </Text>
          )}
        </View>
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
        <Text style={s.hint}>{t('task.hint')}</Text>
      </View>
    </SafeAreaView>
  )
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: { fontSize: 32 },
  title: { fontSize: 22, marginBottom: spacing.sm, textAlign: 'center', lineHeight: 28 },
  sub: { fontSize: 11, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 18 },
  btn: { borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl },
  btnText: { fontFamily: typography.sansBold, fontSize: 14 },
})

const taskStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1e2640' : theme.accent,
      justifyContent: 'space-between',
    },
    top: { padding: spacing.lg, paddingTop: spacing.xxl },
    altBanner: {
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: radius.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    altBannerText: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      marginBottom: spacing.lg,
    },
    badgeText: {
      fontFamily: typography.sansBold,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.75)',
    },
    label: {
      fontFamily: typography.sansBold,
      fontSize: 10,
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
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.dark ? '#5a6480' : 'rgba(255,255,255,0.6)',
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
      fontSize: 13,
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
      fontSize: 11,
      color: theme.dark ? '#8a90a8' : 'rgba(255,255,255,0.8)',
    },
    hint: {
      fontFamily: typography.sans,
      fontSize: 10,
      color: 'rgba(255,255,255,0.3)',
      textAlign: 'center',
    },
  })
