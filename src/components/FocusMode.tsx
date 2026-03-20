import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
} from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { tapSuccess } from '../lib/haptics'
import { typography, radius, spacing } from '../lib/theme'

interface FocusModeProps {
  visible: boolean
  taskText: string
  onDone: () => void
  onExit: () => void
}

function pad(n: number) { return n.toString().padStart(2, '0') }

export function FocusMode({ visible, taskText, onDone, onExit }: FocusModeProps) {
  const theme = useTheme()
  const t = useT()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!visible) { setSeconds(0); return }
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [visible])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const handleDone = () => {
    tapSuccess()
    onDone()
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onExit}>
      <View style={[s.container, { backgroundColor: theme.bg }]}>
        <Text style={[s.status, { color: theme.muted }]}>{t('task.focusMode.on')}</Text>

        <Text style={[s.taskText, { color: theme.text }]}>{taskText}</Text>

        {mins > 0 && (
          <Text style={[s.timer, { color: theme.accent }]}>
            {pad(mins)}:{pad(secs)}
          </Text>
        )}

        <View style={s.bottom}>
          <TouchableOpacity style={[s.doneBtn, { backgroundColor: theme.accent }]} onPress={handleDone}>
            <Text style={s.doneBtnText}>{t('task.focusMode.done')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.exitBtn} onPress={onExit}>
            <Text style={[s.exitBtnText, { color: theme.muted }]}>{t('task.focusMode.exit')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  status: {
    fontFamily: typography.sans,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  taskText: {
    fontFamily: typography.serifItalic,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  timer: {
    fontFamily: typography.serif,
    fontSize: 42,
    marginBottom: spacing.xl,
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  doneBtn: {
    width: '100%',
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  doneBtnText: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: '#fff',
  },
  exitBtn: {
    padding: 10,
  },
  exitBtnText: {
    fontFamily: typography.sans,
    fontSize: 13,
  },
})
