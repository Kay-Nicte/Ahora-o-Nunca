import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { Reward } from '../lib/rewards'
import { typography, radius, colors } from '../lib/theme'

interface RewardModalProps {
  reward: Reward | null
  onClose: () => void
}

export function RewardModal({ reward, onClose }: RewardModalProps) {
  const theme = useTheme()
  const t = useT()
  const language = useAppStore((s) => s.language)

  if (!reward) return null

  const label = language === 'es' ? reward.label_es : reward.label_en
  const icon = reward.type === 'avatar' ? reward.value :
               reward.type === 'background' ? '●' :
               '★'

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.card, { backgroundColor: theme.dark ? theme.surface : theme.white }]} onPress={(e) => e.stopPropagation()}>
          <Text style={s.icon}>{icon}</Text>
          <Text style={[s.unlocked, { color: theme.accent }]}>{t('rewards.unlocked')}</Text>
          <Text style={[s.label, { color: theme.text }]}>{label}</Text>
          <Text style={[s.type, { color: theme.muted }]}>
            {reward.type === 'avatar' ? 'Avatar' : reward.type === 'title' ? t('rewards.level') : 'Background'}
          </Text>
          <TouchableOpacity style={[s.btn, { backgroundColor: theme.accent }]} onPress={onClose}>
            <Text style={s.btnText}>OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  card: {
    width: '100%', borderRadius: 24, padding: 32, alignItems: 'center',
  },
  icon: { fontSize: 48, marginBottom: 12 },
  unlocked: {
    fontFamily: typography.sansBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  label: {
    fontFamily: typography.serifItalic,
    fontSize: 26,
    marginBottom: 4,
  },
  type: {
    fontFamily: typography.sans,
    fontSize: 13,
    marginBottom: 20,
  },
  btn: {
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  btnText: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.white,
  },
})
