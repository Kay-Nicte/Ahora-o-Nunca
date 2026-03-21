import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { typography, radius, colors } from '../lib/theme'

interface PremiumModalProps {
  visible: boolean
  onClose: () => void
  feature?: string // e.g. "Añadir por voz", "Notificaciones inteligentes"
}

export function PremiumModal({ visible, onClose, feature }: PremiumModalProps) {
  const theme = useTheme()
  const t = useT()

  const handleGetPremium = () => {
    onClose()
    router.push('/paywall')
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.card, {
          backgroundColor: theme.dark ? theme.surface : theme.white,
        }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[s.title, { color: theme.text }]}>
            {feature || 'Esta función'} {t('premium.isPro')}
          </Text>
          <Text style={[s.sub, { color: theme.muted }]}>
            {t('premium.sub')}
          </Text>

          <TouchableOpacity style={s.ctaBtn} onPress={handleGetPremium}>
            <Text style={s.ctaBtnText}>{t('premium.cta')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.dismissBtn} onPress={onClose}>
            <Text style={[s.dismissText, { color: theme.muted }]}>{t('premium.dismiss')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.serifItalic,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: colors.yellow,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 15,
    color: '#1a1e2e',
  },
  dismissBtn: {
    padding: 8,
  },
  dismissText: {
    fontFamily: typography.sans,
    fontSize: 14,
  },
})
