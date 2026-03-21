import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore, AppLanguage } from '../lib/store'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'

const LANGUAGES: { key: AppLanguage; label: string; flag: string }[] = [
  { key: 'es', label: 'Español', flag: '🇪🇸' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'eu', label: 'Euskara', flag: '🇪🇺' },
  { key: 'ca', label: 'Català', flag: '🏳️' },
  { key: 'gl', label: 'Galego', flag: '🏳️' },
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'it', label: 'Italiano', flag: '🇮🇹' },
  { key: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { key: 'pt', label: 'Português', flag: '🇵🇹' },
]

export default function LanguageScreen() {
  const theme = useTheme()
  const t = useT()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.accent }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('language.title')}</Text>
        <Text style={s.sub}>{t('language.sub')}</Text>
      </View>

      <View style={s.options}>
        {LANGUAGES.map((lang) => {
          const selected = language === lang.key
          return (
            <TouchableOpacity
              key={lang.key}
              style={[
                s.card,
                {
                  backgroundColor: selected ? theme.accent + '15' : theme.surface,
                },
              ]}
              onPress={() => setLanguage(lang.key)}
              activeOpacity={0.7}
            >
              <Text style={s.flag}>{lang.flag}</Text>
              <Text style={[s.cardLabel, { color: theme.text }]}>{lang.label}</Text>
              <View style={{ flex: 1 }} />
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
      fontSize: 14,
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
      fontSize: 13,
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
      borderRadius: radius.md,
      padding: 14,
    },
    flag: { fontSize: 24 },
    cardLabel: {
      fontFamily: typography.sansBold,
      fontSize: 15,
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
