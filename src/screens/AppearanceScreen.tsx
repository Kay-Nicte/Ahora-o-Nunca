import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore, AppearanceMode } from '../lib/store'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'

const OPTIONS: { key: AppearanceMode; labelKey: 'appearance.system' | 'appearance.light' | 'appearance.dark'; emoji: string; descKey: 'appearance.system.desc' | 'appearance.light.desc' | 'appearance.dark.desc' }[] = [
  { key: 'system', labelKey: 'appearance.system', emoji: '', descKey: 'appearance.system.desc' },
  { key: 'light', labelKey: 'appearance.light', emoji: '', descKey: 'appearance.light.desc' },
  { key: 'dark', labelKey: 'appearance.dark', emoji: '', descKey: 'appearance.dark.desc' },
]

export default function AppearanceScreen() {
  const theme = useTheme()
  const t = useT()
  const appearanceMode = useAppStore((s) => s.appearanceMode)
  const setAppearanceMode = useAppStore((s) => s.setAppearanceMode)

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.accent }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('appearance.title')}</Text>
        <Text style={s.sub}>{t('appearance.sub')}</Text>
      </View>

      <View style={s.options}>
        {OPTIONS.map((opt) => {
          const selected = appearanceMode === opt.key
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                s.card,
                {
                  backgroundColor: theme.dark ? theme.surface : '#fff',
                  borderColor: selected ? theme.accent : theme.border,
                },
              ]}
              onPress={() => setAppearanceMode(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={s.emoji}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardLabel, { color: theme.text }]}>{t(opt.labelKey)}</Text>
                <Text style={[s.cardDesc, { color: theme.muted }]}>{t(opt.descKey)}</Text>
              </View>
              <View style={[s.radio, { borderColor: selected ? theme.accent : theme.border }]}>
                {selected && <View style={[s.radioDot, { backgroundColor: theme.accent }]} />}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    back: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      marginBottom: 16,
    },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 26,
      color: theme.text,
      marginBottom: 4,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.muted,
    },
    options: {
      paddingHorizontal: 14,
      gap: 8,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 14,
    },
    emoji: { fontSize: 24 },
    cardLabel: {
      fontFamily: typography.sansBold,
      fontSize: 12,
    },
    cardDesc: {
      fontFamily: typography.sans,
      fontSize: 10,
      marginTop: 1,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  })
