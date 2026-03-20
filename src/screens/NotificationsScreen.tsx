import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { spacing, radius, typography, colors } from '../lib/theme'
import { AvatarButton } from '../components/AvatarButton'
import { SunIcon, MoonIcon } from '../components/Icons'
import { BottomNav } from '../components/BottomNav'
import { PremiumModal } from '../components/PremiumModal'
import { useAppStore } from '../lib/store'
import { usePremium } from '../hooks/usePremium'
import { checkNotificationPermission, requestNotificationPermission, scheduleDailyNotification, cancelNotification } from '../lib/notifications'
import { ConfirmModal } from '../components/ConfirmModal'
import { router } from 'expo-router'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      style={[toggleStyles.track, { backgroundColor: on ? theme.accent : theme.border }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[toggleStyles.knob, { left: on ? 21 : 3 }]} />
    </TouchableOpacity>
  )
}

const toggleStyles = StyleSheet.create({
  track: {
    width: 40, height: 22, borderRadius: 999,
    position: 'relative', justifyContent: 'center',
  },
  knob: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff', position: 'absolute', top: 3,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
})

function pad(n: number) { return n.toString().padStart(2, '0') }

// Simple time picker modal with +/- buttons
function TimePicker({ visible, hour, minute, onConfirm, onClose, label, confirmLabel }: {
  visible: boolean
  hour: number
  minute: number
  onConfirm: (h: number, m: number) => void
  onClose: () => void
  label: string
  confirmLabel: string
}) {
  const theme = useTheme()
  const [h, setH] = useState(hour)
  const [m, setM] = useState(minute)

  const incH = () => setH((v) => (v + 1) % 24)
  const decH = () => setH((v) => (v - 1 + 24) % 24)
  const incM = () => setM((v) => {
    const next = v + 15
    return next >= 60 ? 0 : next
  })
  const decM = () => setM((v) => {
    const next = v - 15
    return next < 0 ? 45 : next
  })

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={tpStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[tpStyles.card, { backgroundColor: theme.dark ? theme.surface : '#fff' }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[tpStyles.title, { color: theme.text }]}>{label}</Text>
          <View style={tpStyles.row}>
            {/* Hours */}
            <View style={tpStyles.col}>
              <TouchableOpacity onPress={incH} style={tpStyles.arrowBtn}>
                <Text style={[tpStyles.arrow, { color: theme.accent }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[tpStyles.digit, { color: theme.text }]}>{pad(h)}</Text>
              <TouchableOpacity onPress={decH} style={tpStyles.arrowBtn}>
                <Text style={[tpStyles.arrow, { color: theme.accent }]}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={[tpStyles.colon, { color: theme.muted }]}>:</Text>
            {/* Minutes */}
            <View style={tpStyles.col}>
              <TouchableOpacity onPress={incM} style={tpStyles.arrowBtn}>
                <Text style={[tpStyles.arrow, { color: theme.accent }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[tpStyles.digit, { color: theme.text }]}>{pad(m)}</Text>
              <TouchableOpacity onPress={decM} style={tpStyles.arrowBtn}>
                <Text style={[tpStyles.arrow, { color: theme.accent }]}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[tpStyles.confirm, { backgroundColor: theme.accent }]}
            onPress={() => { onConfirm(h, m); onClose() }}
          >
            <Text style={tpStyles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const tpStyles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  card: { width: '100%', borderRadius: 20, padding: 24, alignItems: 'center' },
  title: { fontFamily: typography.sansBold, fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  col: { alignItems: 'center', width: 60 },
  arrowBtn: { padding: 8 },
  arrow: { fontSize: 18 },
  digit: { fontFamily: typography.serif, fontSize: 42, lineHeight: 48 },
  colon: { fontFamily: typography.serif, fontSize: 36, marginHorizontal: 6 },
  confirm: { borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 40 },
  confirmText: { fontFamily: typography.sansBold, fontSize: 15, color: '#fff' },
})

export default function NotificationsScreen() {
  const theme = useTheme()
  const t = useT()
  const { isPremium } = usePremium()

  const ns = useAppStore((s) => s.notifSettings)
  const setNS = useAppStore((s) => s.setNotifSettings)
  const { fixedEnabled, morningOn, eveningOn, morningH, morningM, eveningH, eveningM, smartEnabled } = ns

  const setFixedEnabled = (v: boolean) => setNS({ fixedEnabled: v })
  const setSmartEnabled = (v: boolean) => setNS({ smartEnabled: v })
  const setMorningOn = (v: boolean) => setNS({ morningOn: v })
  const setEveningOn = (v: boolean) => setNS({ eveningOn: v })
  const setMorningH = (v: number) => setNS({ morningH: v })
  const setMorningM = (v: number) => setNS({ morningM: v })
  const setEveningH = (v: number) => setNS({ eveningH: v })
  const setEveningM = (v: number) => setNS({ eveningM: v })

  const [showPremium, setShowPremium] = useState(false)
  const [showPermModal, setShowPermModal] = useState(false)
  const [showPermDenied, setShowPermDenied] = useState(false)
  const [editingSlot, setEditingSlot] = useState<'morning' | 'evening' | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Ask permission with our modal first, then request system permission
  const ensurePermission = async (onGranted: () => void) => {
    const alreadyGranted = await checkNotificationPermission()
    if (alreadyGranted) {
      onGranted()
      return
    }
    // Show our pretty modal first
    setPendingAction(() => onGranted)
    setShowPermModal(true)
  }

  const handlePermAccepted = async () => {
    setShowPermModal(false)
    const granted = await requestNotificationPermission()
    if (granted && pendingAction) {
      pendingAction()
    } else if (!granted) {
      setShowPermDenied(true)
    }
    setPendingAction(null)
  }

  // Schedule/cancel notifications (asks permission if needed)
  const syncNotifications = async (
    fixed: boolean, mOn: boolean, eOn: boolean,
    mH: number, mM: number, eH: number, eM: number,
  ) => {
    if (!fixed || !mOn) {
      await cancelNotification('morning')
    } else {
      const granted = await checkNotificationPermission()
      if (!granted) {
        ensurePermission(async () => {
          await scheduleDailyNotification(
            'morning', mH, mM,
            t('notif.push.morning.title'), t('notif.push.morning.body'),
          )
        })
        return
      }
      await scheduleDailyNotification(
        'morning', mH, mM,
        t('notif.push.morning.title'), t('notif.push.morning.body'),
      )
    }
    if (!fixed || !eOn) {
      await cancelNotification('evening')
    } else {
      const granted = await checkNotificationPermission()
      if (!granted) return // already asked above
      await scheduleDailyNotification(
        'evening', eH, eM,
        t('notif.push.evening.title'), t('notif.push.evening.body'),
      )
    }
  }

  const toggleFixed = (v: boolean) => {
    setFixedEnabled(v)
    syncNotifications(v, morningOn, eveningOn, morningH, morningM, eveningH, eveningM)
  }
  const toggleMorning = (v: boolean) => {
    setMorningOn(v)
    syncNotifications(fixedEnabled, v, eveningOn, morningH, morningM, eveningH, eveningM)
  }
  const toggleEvening = (v: boolean) => {
    setEveningOn(v)
    syncNotifications(fixedEnabled, morningOn, v, morningH, morningM, eveningH, eveningM)
  }
  const setMorningTimeAndSync = (h: number, m: number) => {
    setMorningH(h); setMorningM(m)
    syncNotifications(fixedEnabled, morningOn, eveningOn, h, m, eveningH, eveningM)
  }
  const setEveningTimeAndSync = (h: number, m: number) => {
    setEveningH(h); setEveningM(m)
    syncNotifications(fixedEnabled, morningOn, eveningOn, morningH, morningM, h, m)
  }

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.accent }]}>{t('back')}</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.title}>{t('notif.title')} <Text style={s.titleEm}>{t('notif.titleEm')}</Text></Text>
          <AvatarButton onPress={() => router.push('/profile')} />
        </View>
        <Text style={s.sub}>{t('notif.sub')}</Text>
      </View>

      <View style={[s.toggleRow, { borderColor: theme.border }]}>
        <View>
          <Text style={[s.toggleLabel, { color: theme.text }]}>{t('notif.fixed')}</Text>
          <Text style={[s.toggleSub, { color: theme.muted }]}>{t('notif.fixed.sub')}</Text>
        </View>
        <Toggle on={fixedEnabled} onToggle={() => toggleFixed(!fixedEnabled)} />
      </View>

      <View style={[s.toggleRow, { borderColor: theme.border }]}>
        <View style={s.smartRow}>
          <View>
            <Text style={[s.toggleLabel, { color: theme.text }]}>{t('notif.smart')}</Text>
            <Text style={[s.toggleSub, { color: theme.muted }]}>{t('notif.smart.sub')}</Text>
          </View>
          <View style={s.proBadge}><Text style={s.proBadgeText}>PRO</Text></View>
        </View>
        <Toggle on={smartEnabled} onToggle={() => {
          if (!isPremium) { setShowPremium(true); return }
          setSmartEnabled(!smartEnabled)
        }} />
      </View>
      <View style={[s.smartHintRow, { borderColor: theme.border }]}>
        <Text style={[s.smartHint, { color: theme.muted }]}>{t('notif.smart.hint')}</Text>
      </View>

      {fixedEnabled && (
        <>
          <Text style={s.sectionLabel}>{t('notif.schedule')}</Text>
          <View style={s.timeGrid}>
            <View style={[s.timeCard, {
              backgroundColor: morningOn
                ? (theme.dark ? '#202640' : '#eef1fa')
                : (theme.dark ? theme.surface : '#fff'),
              borderColor: morningOn ? theme.accent : theme.border,
            }]}>
              <TouchableOpacity onPress={() => toggleMorning(!morningOn)} style={s.timeTop}>
                <SunIcon size={20} color={morningOn ? theme.accent : theme.muted} />
                <Text style={[s.timeName, { color: theme.text }]}>{t('notif.morning')}</Text>
              </TouchableOpacity>
              {morningOn && (
                <TouchableOpacity onPress={() => setEditingSlot('morning')} style={s.timeBottom}>
                  <Text style={s.timeValue}>{pad(morningH)}:{pad(morningM)}</Text>
                  <Text style={[s.tapHint, { color: theme.muted }]}>{t('notif.tapChange')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[s.timeCard, {
              backgroundColor: eveningOn
                ? (theme.dark ? '#202640' : '#eef1fa')
                : (theme.dark ? theme.surface : '#fff'),
              borderColor: eveningOn ? theme.accent : theme.border,
            }]}>
              <TouchableOpacity onPress={() => toggleEvening(!eveningOn)} style={s.timeTop}>
                <MoonIcon size={20} color={eveningOn ? theme.accent : theme.muted} />
                <Text style={[s.timeName, { color: theme.text }]}>{t('notif.evening')}</Text>
              </TouchableOpacity>
              {eveningOn && (
                <TouchableOpacity onPress={() => setEditingSlot('evening')} style={s.timeBottom}>
                  <Text style={s.timeValue}>{pad(eveningH)}:{pad(eveningM)}</Text>
                  <Text style={[s.tapHint, { color: theme.muted }]}>{t('notif.tapChange')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {/* Time picker modals */}
      <TimePicker
        visible={editingSlot === 'morning'}
        hour={morningH}
        minute={morningM}
        label={t('notif.morningTime')}
        confirmLabel={t('notif.done')}
        onConfirm={(h, m) => setMorningTimeAndSync(h, m)}
        onClose={() => setEditingSlot(null)}
      />
      <TimePicker
        visible={editingSlot === 'evening'}
        hour={eveningH}
        minute={eveningM}
        label={t('notif.eveningTime')}
        confirmLabel={t('notif.done')}
        onConfirm={(h, m) => setEveningTimeAndSync(h, m)}
        onClose={() => setEditingSlot(null)}
      />

      <ConfirmModal
        visible={showPermModal}
        onClose={() => { setShowPermModal(false); setPendingAction(null) }}
        title=""
        message={t('notif.permMsg')}
        confirmText="OK"
        cancelText={t('tasks.action.cancel')}
        onConfirm={handlePermAccepted}
      />
      <ConfirmModal
        visible={showPermDenied}
        onClose={() => setShowPermDenied(false)}
        title={t('notif.permTitle')}
        message={t('notif.permDenied')}
        confirmText="OK"
        cancelText={t('tasks.action.cancel')}
        onConfirm={() => {}}
      />

      <View style={{ flex: 1 }} />
      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
        feature={t('premium.smartNotif')}
      />
      <BottomNav active="add" />
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
      backgroundColor: theme.surface,
    },
    back: { fontFamily: typography.sansBold, fontSize: 14, marginBottom: 10 },
    headerRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 6,
    },
    title: { fontFamily: typography.serif, fontSize: 26, color: theme.text },
    titleEm: { fontFamily: typography.serifItalic, color: theme.accent },
    sub: { fontFamily: typography.sans, fontSize: 13, color: theme.muted },
    toggleRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
    },
    smartRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 12 },
    toggleLabel: { fontFamily: typography.sansBold, fontSize: 14 },
    toggleSub: { fontFamily: typography.sans, fontSize: 12, marginTop: 2 },
    proBadge: {
      backgroundColor: colors.yellow, paddingHorizontal: 7,
      paddingVertical: 2, borderRadius: radius.full,
    },
    proBadgeText: {
      fontFamily: typography.sansBold, fontSize: 8,
      letterSpacing: 1, textTransform: 'uppercase', color: '#1a1e2e',
    },
    smartHintRow: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 1,
      backgroundColor: theme.dark ? 'rgba(91,126,201,0.05)' : 'rgba(91,126,201,0.04)',
    },
    smartHint: {
      fontFamily: typography.sans,
      fontSize: 12,
      lineHeight: 15,
    },
    sectionLabel: {
      fontFamily: typography.sansBold, fontSize: 11, letterSpacing: 2,
      textTransform: 'uppercase', color: theme.muted,
      paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8,
    },
    timeGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
    timeCard: {
      flex: 1, borderWidth: 1.5, borderRadius: radius.md, padding: 12, alignItems: 'center',
    },
    timeTop: { alignItems: 'center' },
    timeBottom: { alignItems: 'center', marginTop: 4 },
    timeEmoji: { fontSize: 18, marginBottom: 4 },
    timeName: { fontFamily: typography.sansBold, fontSize: 13, marginBottom: 2 },
    timeValue: {
      fontFamily: typography.sansBold, fontSize: 16, color: theme.accent, textAlign: 'center',
    },
    tapHint: { fontFamily: typography.sans, fontSize: 8, textAlign: 'center', marginTop: 2 },
  })
