import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useT } from '../lib/i18n'
import { spacing, radius, typography, colors } from '../lib/theme'
import { ConfirmModal } from '../components/ConfirmModal'

export default function PrivacyScreen() {
  const theme = useTheme()
  const t = useT()
  const { signOut } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[s.back, { color: theme.accent }]}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>{t('privacy.title')}</Text>
          <Text style={s.sub}>{t('privacy.sub')}</Text>
        </View>

        <View style={[s.section, { borderColor: theme.border }]}>
          <View style={[s.infoRow, { borderColor: theme.border }]}>
            <Text style={[s.infoTitle, { color: theme.text }]}>{t('privacy.what')}</Text>
            <Text style={[s.infoText, { color: theme.muted }]}>{t('privacy.what.answer')}</Text>
          </View>

          <View style={[s.infoRow, { borderColor: theme.border }]}>
            <Text style={[s.infoTitle, { color: theme.text }]}>{t('privacy.sell')}</Text>
            <Text style={[s.infoText, { color: theme.muted }]}>{t('privacy.sell.answer')}</Text>
          </View>

          <TouchableOpacity
            style={[s.actionRow, { borderColor: theme.border }]}
            onPress={() => setShowExport(true)}
          >
            <Text style={[s.actionText, { color: theme.accent }]}>{t('privacy.export')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionRow, { borderColor: theme.border }]}
            onPress={() => setShowDelete(true)}
          >
            <Text style={[s.actionText, { color: colors.error }]}>{t('privacy.delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        title={t('privacy.export')}
        message={t('privacy.export.msg')}
        confirmText="OK"
        cancelText={t('privacy.delete.cancel')}
        onConfirm={() => {}}
      />

      <ConfirmModal
        visible={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('privacy.delete.title')}
        message={t('privacy.delete.msg')}
        confirmText={t('privacy.delete.confirm')}
        cancelText={t('privacy.delete.cancel')}
        onConfirm={async () => {
          await signOut()
          router.replace('/')
        }}
        destructive
      />
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
    section: {
      borderTopWidth: 1,
    },
    infoRow: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    infoTitle: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      marginBottom: 4,
    },
    infoText: {
      fontFamily: typography.sans,
      fontSize: 11,
      lineHeight: 17,
    },
    actionRow: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    actionText: {
      fontFamily: typography.sansBold,
      fontSize: 12,
    },
  })
