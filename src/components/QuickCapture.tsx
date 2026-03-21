import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, Pressable, Animated, Keyboard,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { useT } from '../lib/i18n'
import { tapSuccess } from '../lib/haptics'
import { typography, radius, spacing, colors } from '../lib/theme'

export function QuickCapture() {
  const theme = useTheme()
  const t = useT()
  const insets = useSafeAreaInsets()
  const { createTask } = useTasks()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleSave = async () => {
    if (!text.trim()) return
    tapSuccess()
    await createTask(text.trim(), [])
    setText('')
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setOpen(false)
    }, 800)
  }

  const handleOpen = () => {
    setOpen(true)
    setSaved(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 80, backgroundColor: theme.accent }]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Capture modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => { Keyboard.dismiss(); setOpen(false) }}>
          <Pressable style={[s.card, { backgroundColor: theme.dark ? theme.surface : theme.white }]} onPress={(e) => e.stopPropagation()}>
            {saved ? (
              <Text style={[s.savedText, { color: theme.accent }]}>{t('capture.saved')}</Text>
            ) : (
              <>
                <TextInput
                  ref={inputRef}
                  style={[s.input, {
                    backgroundColor: theme.dark ? theme.bg : theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  }]}
                  placeholder={t('capture.placeholder')}
                  placeholderTextColor={theme.muted}
                  value={text}
                  onChangeText={setText}
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                  autoFocus
                />
                <TouchableOpacity
                  style={[s.saveBtn, { backgroundColor: theme.accent }, !text.trim() && { opacity: 0.4 }]}
                  onPress={handleSave}
                  disabled={!text.trim()}
                >
                  <Text style={s.saveBtnText}>✓</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 50,
  },
  fabText: {
    fontFamily: typography.sans,
    fontSize: 22,
    color: colors.white,
    lineHeight: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 14,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontFamily: typography.sans,
    fontSize: 15,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 20,
    color: colors.white,
  },
  savedText: {
    fontFamily: typography.serifItalic,
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 8,
  },
})
