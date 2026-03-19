import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAccountNudge } from '../hooks/useAccountNudge'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { typography, radius, colors } from '../lib/theme'

export function AccountNudge() {
  const theme = useTheme()
  const t = useT()
  const { showNudge, reason } = useAccountNudge()
  const dismissNudge = useAppStore((s) => s.dismissNudge)

  if (!showNudge) return null

  const message = reason === 'trial_ending' ? t('nudge.trial') : t('nudge.tasks')

  return (
    <View style={[s.container, {
      backgroundColor: theme.dark ? theme.surface : '#fff',
      borderColor: theme.border,
    }]}>
      <Text style={[s.message, { color: theme.text }]}>{message}</Text>
      <View style={s.actions}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => { dismissNudge(); router.push('/login') }}
        >
          <Text style={s.ctaText}>{t('nudge.cta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.laterBtn} onPress={dismissNudge}>
          <Text style={[s.laterText, { color: theme.muted }]}>{t('nudge.later')}</Text>
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
  message: {
    fontFamily: typography.sans,
    fontSize: 12,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  ctaText: {
    fontFamily: typography.sansBold,
    fontSize: 11,
    color: '#fff',
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterText: {
    fontFamily: typography.sans,
    fontSize: 11,
  },
})
