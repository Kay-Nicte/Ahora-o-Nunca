import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { typography, radius, spacing, colors } from '../lib/theme'

export function ResumeBanner() {
  const theme = useTheme()
  const t = useT()
  const currentTask = useAppStore((s) => s.currentTask)
  const setCurrentTask = useAppStore((s) => s.setCurrentTask)

  if (!currentTask) return null

  return (
    <View style={[s.container, {
      backgroundColor: theme.dark ? '#1e2238' : '#edf0f8',
      borderColor: theme.accent,
    }]}>
      <Text style={[s.label, { color: theme.muted }]}>{t('resume.title')}</Text>
      <Text style={[s.taskName, { color: theme.text }]} numberOfLines={1}>{currentTask.text}</Text>
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.continueBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/task')}
        >
          <Text style={s.continueBtnText}>{t('resume.continue')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => setCurrentTask(null)}
        >
          <Text style={[s.skipBtnText, { color: theme.muted }]}>{t('resume.skip')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: 14,
  },
  label: {
    fontFamily: typography.sans,
    fontSize: 12,
    marginBottom: 4,
  },
  taskName: {
    fontFamily: typography.serifItalic,
    fontSize: 18,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continueBtn: {
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  continueBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 13,
    color: colors.white,
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipBtnText: {
    fontFamily: typography.sans,
    fontSize: 13,
  },
})
