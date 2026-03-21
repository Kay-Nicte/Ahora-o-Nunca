import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { typography, radius, colors } from '../lib/theme'

interface ConfirmModalProps {
  visible: boolean
  onClose: () => void
  title: string
  message?: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmModal({
  visible, onClose, title, message, confirmText, cancelText, onConfirm, destructive,
}: ConfirmModalProps) {
  const theme = useTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[s.card, { backgroundColor: theme.dark ? theme.surface : theme.white }]}
          onPress={(e) => e.stopPropagation()}
        >
          {message ? (
            <>
              <Text style={[s.title, { color: theme.text }]}>{title}</Text>
              <Text style={[s.message, { color: theme.muted }]}>{message}</Text>
            </>
          ) : null}

          <TouchableOpacity
            style={[s.btn, { backgroundColor: destructive ? colors.error : theme.accent }]}
            onPress={() => { onConfirm(); onClose() }}
          >
            <Text style={s.btnText}>{confirmText}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancel} onPress={onClose}>
            <Text style={[s.cancelText, { color: theme.muted }]}>{cancelText}</Text>
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
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.serifItalic,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: typography.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnText: {
    fontFamily: typography.sansBold,
    fontSize: 15,
    color: colors.white,
  },
  cancel: {
    padding: 8,
  },
  cancelText: {
    fontFamily: typography.sans,
    fontSize: 14,
  },
})
