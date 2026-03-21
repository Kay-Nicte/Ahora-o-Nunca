import React, { useState } from 'react'
import {
  Text, TouchableOpacity, StyleSheet, Modal, Pressable, View,
} from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { usePremium } from '../hooks/usePremium'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { typography, colors, radius } from '../lib/theme'

export function TrialBanner() {
  const theme = useTheme()
  const t = useT()
  const { showTrialBanner } = usePremium()
  const activateTrial = useAppStore((s) => s.activateTrial)
  const [showModal, setShowModal] = useState(false)

  if (!showTrialBanner) return null

  return (
    <>
      <TouchableOpacity
        style={s.banner}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
      >
        <Text style={s.bannerText}>{t('trial.banner')}</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setShowModal(false)}>
          <Pressable
            style={[s.card, { backgroundColor: theme.dark ? theme.surface : theme.white }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[s.title, { color: theme.text }]}>{t('trial.modal.title')}</Text>
            <Text style={[s.sub, { color: theme.muted }]}>{t('trial.modal.sub')}</Text>

            <TouchableOpacity
              style={s.activateBtn}
              onPress={() => { activateTrial(); setShowModal(false) }}
            >
              <Text style={s.activateBtnText}>{t('trial.modal.activate')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.laterBtn} onPress={() => setShowModal(false)}>
              <Text style={[s.laterText, { color: theme.muted }]}>{t('trial.modal.later')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  banner: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: colors.yellow,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    fontFamily: typography.sansBold,
    fontSize: 15,
    color: colors.textLight,
  },
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
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.serifItalic,
    fontSize: 24,
    marginBottom: 8,
  },
  sub: {
    fontFamily: typography.sans,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  activateBtn: {
    width: '100%',
    backgroundColor: colors.yellow,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  activateBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.textLight,
  },
  laterBtn: { padding: 8 },
  laterText: {
    fontFamily: typography.sans,
    fontSize: 14,
  },
})
