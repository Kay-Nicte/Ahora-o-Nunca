import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Pressable, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useT } from '../lib/i18n'
import { spacing, radius, typography, colors } from '../lib/theme'
import { ChevronRightIcon } from '../components/Icons'
import { ConfirmModal } from '../components/ConfirmModal'
import { usePremium } from '../hooks/usePremium'
import { getLevel, REWARDS } from '../lib/rewards'
import { AvatarButton } from '../components/AvatarButton'
import { BottomNav } from '../components/BottomNav'

const LANGUAGE_LABELS = { es: 'Español', en: 'English', eu: 'Euskara', ca: 'Català', gl: 'Galego', fr: 'Français', it: 'Italiano', de: 'Deutsch', pt: 'Português' } as const

export default function ProfileScreen() {
  const theme = useTheme()
  const t = useT()
  const profile = useAppStore((s) => s.profile)
  const userEmail = useAppStore((s) => s.userEmail)
  const appearanceMode = useAppStore((s) => s.appearanceMode)
  const language = useAppStore((s) => s.language)
  const shakeEnabled = useAppStore((s) => s.shakeEnabled)
  const setShakeEnabled = useAppStore((s) => s.setShakeEnabled)
  const calmTools = useAppStore((s) => s.calmTools)
  const setCalmTools = useAppStore((s) => s.setCalmTools)
  const { signOut } = useAuth()
  const { isPremium, isTrial, trialDaysLeft } = usePremium()
  const [showLogout, setShowLogout] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [editName, setEditName] = useState(profile?.username || '')

  const displayName = profile?.username || userEmail?.split('@')[0] || 'Usuario'

  const handleSaveName = async () => {
    const name = editName.trim()
    if (!name) return
    // Update in Supabase if connected
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ username: name }).eq('id', user.id)
      }
    } catch (_) {}
    // Update local
    useAppStore.setState({
      profile: { ...(profile || { id: 'local', avatar_url: null, is_premium: false, premium_since: null, created_at: new Date().toISOString() }), username: name },
    })
    setShowEditName(false)
  }
  const totalCompleted = useAppStore((s) => s.totalCompleted)
  const unlockedRewards = useAppStore((s) => s.unlockedRewards)
  const profileBackground = useAppStore((s) => s.profileBackground)
  const setProfileBackground = useAppStore((s) => s.setProfileBackground)
  const unlockedBgs = REWARDS.filter((r) => r.type === 'background' && unlockedRewards.includes(r.id))
  const level = getLevel(totalCompleted)
  const ns = useAppStore((s) => s.notifSettings)

  const pad = (n: number) => n.toString().padStart(2, '0')
  const notifSummary = (() => {
    if (!ns.fixedEnabled && !ns.smartEnabled) return t('profile.notConfigured')
    const parts: string[] = []
    if (ns.fixedEnabled && ns.morningOn) parts.push(`${pad(ns.morningH)}:${pad(ns.morningM)}`)
    if (ns.fixedEnabled && ns.eveningOn) parts.push(`${pad(ns.eveningH)}:${pad(ns.eveningM)}`)
    if (ns.smartEnabled) parts.push('Smart')
    return parts.join(` ${t('profile.notifStatus')} `)
  })()

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={[s.header, profileBackground && { backgroundColor: profileBackground }]}>
          <AvatarButton size={48} onPress={() => router.push('/avatar')} />
          <TouchableOpacity onPress={() => { setEditName(profile?.username || ''); setShowEditName(true) }}>
            <Text style={[s.name, profileBackground && { color: '#fff' }]}>{displayName}</Text>
            <Text style={[s.email, profileBackground && { color: 'rgba(255,255,255,0.7)' }]}>{userEmail || t('profile.noAccount')}</Text>
            <Text style={[s.levelBadge, { color: profileBackground ? 'rgba(255,255,255,0.8)' : theme.accent }]}>
              {t('rewards.level')} {level.level} — {language === 'es' ? level.title_es : level.title_en} · {totalCompleted} {t('rewards.tasksTotal')}
            </Text>
          </TouchableOpacity>
          {unlockedBgs.length > 0 && (
            <View style={s.bgRow}>
              <TouchableOpacity
                style={[s.bgDot, { backgroundColor: theme.bg, borderColor: !profileBackground ? theme.accent : theme.border }]}
                onPress={() => setProfileBackground(null)}
              />
              {unlockedBgs.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[s.bgDot, { backgroundColor: bg.value, borderColor: profileBackground === bg.value ? theme.accent : 'transparent' }]}
                  onPress={() => setProfileBackground(bg.value)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Settings rows */}
        <View style={[s.section, { borderColor: theme.border }]}>
          {/* Premium */}
          <TouchableOpacity style={[s.row, s.premiumRow, { borderColor: theme.border }]} onPress={() => router.push('/paywall')}>
            <View>
              <View style={s.premiumLabel}>
                <Text style={[s.rowText, { color: theme.text }]}>{t('profile.premium')}</Text>
                <View style={s.proBadge}>
                  <Text style={s.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={[s.rowSub, { color: theme.muted }]}>
                {isTrial ? `${trialDaysLeft} ${t('profile.trialActive')}` : isPremium ? t('profile.premiumActive') : t('profile.freePlan')}
              </Text>
            </View>
            <ChevronRightIcon size={14} color={theme.muted} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity style={[s.row, { borderColor: theme.border }]} onPress={() => router.push('/notifications')}>
            <View>
              <Text style={[s.rowText, { color: theme.text }]}>{t('profile.notifications')}</Text>
              <Text style={[s.rowSub, { color: theme.muted }]}>{notifSummary}</Text>
            </View>
            <ChevronRightIcon size={14} color={theme.muted} />
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity style={[s.row, { borderColor: theme.border }]} onPress={() => router.push('/language')}>
            <View>
              <Text style={[s.rowText, { color: theme.text }]}>{t('profile.language')}</Text>
              <Text style={[s.rowSub, { color: theme.muted }]}>{LANGUAGE_LABELS[language]}</Text>
            </View>
            <ChevronRightIcon size={14} color={theme.muted} />
          </TouchableOpacity>

          {/* Appearance */}
          <TouchableOpacity style={[s.row, { borderColor: theme.border }]} onPress={() => router.push('/appearance')}>
            <View>
              <Text style={[s.rowText, { color: theme.text }]}>{t('profile.appearance')}</Text>
              <Text style={[s.rowSub, { color: theme.muted }]}>{t(`appearance.${appearanceMode}` as any)}</Text>
            </View>
            <ChevronRightIcon size={14} color={theme.muted} />
          </TouchableOpacity>

          {/* Shake */}
          <View style={[s.row, { borderColor: theme.border }]}>
            <View>
              <Text style={[s.rowText, { color: theme.text }]}>{t('profile.shake')}</Text>
              <Text style={[s.rowSub, { color: theme.muted }]}>{t('profile.shake.sub')}</Text>
            </View>
            <TouchableOpacity
              style={[s.toggleTrack, { backgroundColor: shakeEnabled ? theme.accent : theme.border }]}
              onPress={() => setShakeEnabled(!shakeEnabled)}
            >
              <View style={[s.toggleKnob, { left: shakeEnabled ? 21 : 3 }]} />
            </TouchableOpacity>
          </View>

          {/* Calm tools */}
          <View style={[s.row, { borderColor: theme.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[s.rowText, { color: theme.text, marginBottom: 4 }]}>{t('profile.calmTools')}</Text>
            <Text style={[s.rowSub, { color: theme.muted, marginBottom: 10 }]}>{t('profile.calmTools.sub')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['discharge', 'grounding', 'breathe'] as const).map((tool) => (
                <TouchableOpacity
                  key={tool}
                  style={[s.calmChip, { borderColor: calmTools[tool] ? theme.accent : theme.border, backgroundColor: calmTools[tool] ? theme.accent + '18' : 'transparent' }]}
                  onPress={() => setCalmTools({ [tool]: !calmTools[tool] })}
                >
                  <Text style={[s.calmChipText, { color: calmTools[tool] ? theme.accent : theme.muted }]}>
                    {t(`calm.${tool}` as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy */}
          <TouchableOpacity style={[s.row, { borderColor: theme.border }]} onPress={() => router.push('/privacy')}>
            <View>
              <Text style={[s.rowText, { color: theme.text }]}>{t('profile.privacy')}</Text>
            </View>
            <ChevronRightIcon size={14} color={theme.muted} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[s.row, { borderColor: theme.border }]}
            onPress={() => setShowLogout(true)}
          >
            <Text style={[s.rowText, { color: colors.error }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit name modal */}
      <Modal visible={showEditName} transparent animationType="fade" onRequestClose={() => setShowEditName(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setShowEditName(false)}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.dark ? theme.surface : '#fff' }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[s.modalTitle, { color: theme.text }]}>{t('profile.editName')}</Text>
            <TextInput
              style={[s.modalInput, {
                backgroundColor: theme.dark ? theme.bg : '#f0f2f7',
                borderColor: theme.border,
                color: theme.text,
              }]}
              value={editName}
              onChangeText={setEditName}
              placeholder={t('profile.editName.placeholder')}
              placeholderTextColor={theme.muted}
              autoFocus
            />
            <TouchableOpacity
              style={[s.modalSaveBtn, { backgroundColor: theme.accent }, !editName.trim() && { opacity: 0.4 }]}
              onPress={handleSaveName}
              disabled={!editName.trim()}
            >
              <Text style={s.modalSaveBtnText}>{t('profile.editName.save')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        title={t('profile.logout.confirm')}
        message={t('profile.logout.msg')}
        confirmText={t('profile.logout')}
        cancelText={t('tasks.action.cancel')}
        onConfirm={async () => {
          await signOut()
          useAppStore.setState({ profile: null, hasSeenOnboarding: false })
          router.replace('/onboarding')
        }}
        destructive
      />
      <BottomNav active="home" />
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 44,
      paddingBottom: 20,
    },
    name: {
      fontFamily: typography.serifItalic,
      fontSize: 18,
      color: theme.text,
    },
    email: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: theme.muted,
    },
    bgRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    bgDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
    },
    levelBadge: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      marginTop: 4,
    },
    section: {
      borderTopWidth: 1,
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    premiumRow: {
      backgroundColor: theme.dark ? 'rgba(245,200,0,0.06)' : 'rgba(245,200,0,0.08)',
    },
    premiumLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    proBadge: {
      backgroundColor: colors.yellow,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    proBadgeText: {
      fontFamily: typography.sansBold,
      fontSize: 8,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#1a1e2e',
    },
    rowText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
    },
    rowSub: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      marginTop: 2,
    },
    calmChip: {
      borderWidth: 1.5,
      borderRadius: radius.full,
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
    calmChipText: {
      fontFamily: typography.sansBold,
      fontSize: 12,
    },
    toggleTrack: {
      width: 40, height: 22, borderRadius: 999,
      position: 'relative', justifyContent: 'center',
    },
    toggleKnob: {
      width: 16, height: 16, borderRadius: 8,
      backgroundColor: '#fff', position: 'absolute', top: 3,
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3,
    },
    modalBackdrop: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center', alignItems: 'center', padding: 30,
    },
    modalCard: {
      width: '100%', borderRadius: 20, padding: 24, alignItems: 'center',
    },
    modalTitle: {
      fontFamily: typography.serifItalic, fontSize: 20, marginBottom: 16,
    },
    modalInput: {
      width: '100%', borderWidth: 1.5, borderRadius: 12,
      padding: 12, paddingHorizontal: 14,
      fontFamily: typography.sans, fontSize: 16, marginBottom: 14,
    },
    modalSaveBtn: {
      width: '100%', borderRadius: radius.md, padding: 14, alignItems: 'center',
    },
    modalSaveBtnText: {
      fontFamily: typography.sansBold, fontSize: 15, color: '#fff',
    },
    rowSubNotif: {
      fontFamily: typography.serif,
      fontSize: 16,
      marginTop: 2,
    },
  })
