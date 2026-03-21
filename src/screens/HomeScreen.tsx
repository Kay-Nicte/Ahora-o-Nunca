import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { EnergyLevel, ENERGY_LABELS, ENERGY_SYMBOLS } from '../types'
import { spacing, radius, typography } from '../lib/theme'
import { AvatarButton } from '../components/AvatarButton'
import { BottomNav } from '../components/BottomNav'
import { BoltIcon, FeatherIcon, ClockIcon, SmartphoneIcon } from '../components/Icons'

const ENERGY_ICONS: Record<EnergyLevel, typeof BoltIcon> = {
  high: BoltIcon,
  calm: FeatherIcon,
  short_time: ClockIcon,
  mobile_only: SmartphoneIcon,
}
import { SwipeableScreen } from '../components/SwipeableScreen'
import { tapLight } from '../lib/haptics'
import { TrialBanner } from '../components/TrialBanner'
import { AccountNudge } from '../components/AccountNudge'
import { ResumeBanner } from '../components/ResumeBanner'
import { QuickCapture } from '../components/QuickCapture'
import { WelcomeBack } from '../components/WelcomeBack'
import { useT } from '../lib/i18n'

const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

export default function HomeScreen() {
  const theme = useTheme()
  const t = useT()
  const profile = useAppStore((s) => s.profile)
  const tasks = useAppStore((s) => s.tasks)
  const pendingCount = tasks.filter((tk) => !tk.completed).length
  const now = new Date()
  const completedThisWeek = tasks.filter((tk) => {
    if (!tk.completed || !tk.completed_at) return false
    return new Date(tk.completed_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }).length
  const completedToday = tasks.filter((tk) => {
    if (!tk.completed || !tk.completed_at) return false
    const d = new Date(tk.completed_at)
    return d.toDateString() === now.toDateString()
  }).length
  const { fetchTaskForEnergy } = useTasks()
  const [selected, setSelected] = useState<EnergyLevel[]>([])

  const toggleEnergy = (level: EnergyLevel) => {
    tapLight()
    setSelected((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    )
  }

  const resetSkipped = useAppStore((s) => s.resetSkipped)
  const resetFocusStreak = useAppStore((s) => s.resetFocusStreak)

  const handleSeeTask = async () => {
    if (selected.length === 0) return
    resetSkipped()
    resetFocusStreak()
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
            <WelcomeBack />
          </View>
          <TrialBanner />
          <AccountNudge />
          <ResumeBanner />
          {pendingCount === 0 ? (
            <View style={s.allDone}>
              <Text style={[s.allDoneTitle, { color: theme.accent }]}>{t('allDone.title')}</Text>
              <Text style={[s.allDoneSub, { color: theme.muted }]}>{t('allDone.sub')}</Text>
              <TouchableOpacity style={[s.allDoneBtn, { backgroundColor: theme.accent }]} onPress={() => router.push('/add-task')}>
                <Text style={s.allDoneBtnText}>{t('allDone.add')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <>
          <Text style={s.sectionLabel}>{t('home.state')}</Text>
          <View style={s.energyList}>
            {ENERGY_OPTIONS.map((level) => {
              const isSelected = selected.includes(level)
              return (
                <TouchableOpacity
                  key={level}
                  style={[s.energyRow, isSelected && s.energyRowSelected]}
                  onPress={() => toggleEnergy(level)}
                  activeOpacity={0.7}
                >
                  {React.createElement(ENERGY_ICONS[level], {
                    size: 16,
                    color: isSelected ? theme.onAccent : (theme.dark ? theme.text : theme.muted),
                  })}
                  <Text style={[s.energyName, isSelected && { color: theme.onAccent }]}>
                    {t(`energy.${level}` as any)}
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

              <Text style={s.btnSecondaryText}>{t('home.add')}</Text>
            </TouchableOpacity>
          </View>
          {completedToday > 0 && (
            <Text style={[s.dailySummary, { color: theme.muted }]}>
              {t('summary.title')} {completedToday} {completedToday === 1 ? t('summary.suffix_one') : t('summary.suffix_other')} {t('summary.enough')}
            </Text>
          )}
          {completedThisWeek > 0 && (
            <Text style={[s.weekCount, { color: theme.accent }]}>{completedThisWeek} {t('done.streak')}</Text>
          )}
          </>
          )}
        </ScrollView>
        <BottomNav active="home" />
        <QuickCapture />
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
      fontFamily: typography.serifItalic,
      fontSize: 14,
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
      color: theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: theme.muted,
      marginTop: 3,
    },
    sectionLabel: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: theme.muted,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    energyList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 14,
      gap: 8,
    },
    energyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '48%',
      paddingVertical: 12,
      borderRadius: radius.md,
      backgroundColor: theme.dark ? theme.surface : theme.surface,
    },
    energyRowSelected: {
      backgroundColor: theme.accent,
    },
    energyName: {
      fontFamily: typography.serifItalic,
      fontSize: 16,
      color: theme.dark ? theme.text : theme.muted,
    },
    btns: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: 14,
      paddingTop: spacing.md,
      marginBottom: 20,
    },
    btnPrimary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.accent,
      borderRadius: radius.full,
      padding: 16,
      elevation: 6,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    btnDisabled: { opacity: 0.4, elevation: 0, shadowOpacity: 0 },
    btnPrimaryText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: theme.onAccent,
    },
    btnSecondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.surface,
      borderRadius: radius.full,
      padding: 12,
    },
    btnSecondaryText: {
      fontFamily: typography.sansBold,
      fontSize: 13,
      color: theme.muted,
    },
    weekCount: {
      fontFamily: typography.sansBold,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 20,
    },
    dailySummary: {
      fontFamily: typography.serifItalic,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 16,
    },
    allDone: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    allDoneTitle: {
      fontFamily: typography.serifItalic,
      fontSize: 28,
      marginBottom: 8,
    },
    allDoneSub: {
      fontFamily: typography.sans,
      fontSize: 14,
      marginBottom: 24,
    },
    allDoneBtn: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 32,
    },
    allDoneBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: theme.onAccent,
    },
    micDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  })
