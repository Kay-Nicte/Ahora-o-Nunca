import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { EnergyLevel, ENERGY_LABELS, ENERGY_EMOJIS } from '../types'
import { spacing, radius, typography } from '../lib/theme'
import { AvatarButton } from '../components/AvatarButton'
import { BottomNav } from '../components/BottomNav'
import { BoltIcon } from '../components/Icons'
import { SwipeableScreen } from '../components/SwipeableScreen'
import { useT } from '../lib/i18n'

const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

export default function HomeScreen() {
  const theme = useTheme()
  const t = useT()
  const profile = useAppStore((s) => s.profile)
  const { fetchTaskForEnergy } = useTasks()
  const [selected, setSelected] = useState<EnergyLevel[]>([])

  const toggleEnergy = (level: EnergyLevel) => {
    setSelected((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    )
  }

  const handleSeeTask = async () => {
    if (selected.length === 0) return
    await fetchTaskForEnergy(selected)
    router.push('/task')
  }

  const s = styles(theme)

  return (
    <SwipeableScreen activeTab="home">
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <View style={s.greetingRow}>
              <Text style={s.greeting}>
                {t('home.greeting')}{profile?.username ? `, ${profile.username}` : ''}
              </Text>
              <AvatarButton onPress={() => router.push('/profile')} />
            </View>
            <Text style={s.title}>{t('home.title')}{'\n'}<Text style={s.titleEm}>{t('home.titleEm')}</Text></Text>
            <Text style={s.sub}>{t('home.sub')}</Text>
          </View>
          <Text style={s.sectionLabel}>{t('home.state')}</Text>
          <View style={s.grid}>
            {ENERGY_OPTIONS.map((level) => {
              const isSelected = selected.includes(level)
              return (
                <TouchableOpacity
                  key={level}
                  style={[s.card, isSelected && s.cardSelected]}
                  onPress={() => toggleEnergy(level)}
                  activeOpacity={0.7}
                >
                  <Text style={s.cardEmoji}>{ENERGY_EMOJIS[level]}</Text>
                  <Text style={[s.cardName, isSelected && s.cardNameSelected]}>
                    {t(`energy.${level}` as any)}
                  </Text>
                  <Text style={[s.cardDesc, isSelected && s.cardDescSelected]}>
                    {t(`energy.${level}.desc` as any)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={s.btns}>
            <TouchableOpacity
              style={[s.btnPrimary, selected.length === 0 && s.btnDisabled]}
              onPress={handleSeeTask}
              disabled={selected.length === 0}
            >
              <BoltIcon size={16} color="#fff" />
              <Text style={s.btnPrimaryText}>{t('home.seeTask')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => router.push('/add-task')}
            >
              <View style={[s.micDot, { backgroundColor: theme.accent }]} />
              <Text style={s.btnSecondaryText}>{t('home.add')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNav active="home" />
      </SafeAreaView>
    </SwipeableScreen>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingBottom: 80 },
    header: {
      padding: spacing.md,
      paddingTop: 8,
      backgroundColor: theme.dark
        ? theme.surface
        : theme.surface,
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    greeting: {
      fontFamily: typography.sans,
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: theme.muted,
      marginBottom: 6,
    },
    title: {
      fontFamily: typography.serif,
      fontSize: 26,
      color: theme.text,
      lineHeight: 32,
      marginBottom: 4,
    },
    titleEm: {
      fontFamily: typography.serifItalic,
      color: theme.dark ? '#6b8ed9' : theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.muted,
      marginTop: 3,
    },
    sectionLabel: {
      fontFamily: typography.sansBold,
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.muted,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 14,
      gap: spacing.sm,
    },
    card: {
      width: '47%',
      backgroundColor: theme.dark ? theme.surface : '#fff',
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: radius.md,
      padding: 12,
    },
    cardSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.dark ? '#202640' : '#eef1fa',
    },
    cardEmoji: { fontSize: 20, marginBottom: 5 },
    cardName: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      color: theme.text,
      marginBottom: 2,
    },
    cardNameSelected: { color: theme.accent },
    cardDesc: {
      fontFamily: typography.sans,
      fontSize: 9,
      color: theme.muted,
      lineHeight: 13,
    },
    cardDescSelected: { color: theme.accent },
    btns: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: 14,
      paddingTop: spacing.md,
    },
    btnPrimary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      padding: 14,
    },
    btnDisabled: { opacity: 0.4 },
    btnPrimaryText: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      color: '#fff',
    },
    btnSecondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: radius.md,
      padding: 12,
    },
    btnSecondaryText: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      color: theme.muted,
    },
    micDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  })
