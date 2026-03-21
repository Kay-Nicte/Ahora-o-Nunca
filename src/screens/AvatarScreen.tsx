import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useT } from '../lib/i18n'
import { spacing, radius, typography, colors } from '../lib/theme'
import { CameraIcon, ImageIcon } from '../components/Icons'
import { REWARDS } from '../lib/rewards'
import { ConfirmModal } from '../components/ConfirmModal'

const AVATAR_OPTIONS = [
  { emoji: '🦊', bg: '#5b7ec9' },
  { emoji: '🐙', bg: '#7b9e87' },
  { emoji: '🦋', bg: '#c97d4e' },
  { emoji: '🌙', bg: '#8b6bb1' },
  { emoji: '🌿', bg: '#e05555' },
  { emoji: '⚡', bg: '#5b8ea8' },
  { emoji: '🔥', bg: '#a08060' },
  { emoji: '🌊', bg: '#607890' },
]

export default function AvatarScreen() {
  const theme = useTheme()
  const t = useT()
  const { avatarEmoji, avatarBg, avatarImageUri, setAvatarEmoji, setAvatarImage } = useAppStore()
  const unlockedRewards = useAppStore((s) => s.unlockedRewards)

  // Merge base avatars with unlocked reward avatars
  const unlockedAvatars = REWARDS
    .filter((r) => r.type === 'avatar' && unlockedRewards.includes(r.id))
    .map((r) => ({ emoji: r.value, bg: '#9b8ec4' }))
  const allAvatars = [...AVATAR_OPTIONS, ...unlockedAvatars]

  // Local state to preview before saving
  const [selectedIdx, setSelectedIdx] = useState<number | null>(() => {
    if (!avatarEmoji) return null
    return allAvatars.findIndex((o) => o.emoji === avatarEmoji)
  })
  const [previewUri, setPreviewUri] = useState<string | null>(avatarImageUri)
  const [permMessage, setPermMessage] = useState<string | null>(null)

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setPermMessage(t('avatar.permGallery'))
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri)
      setSelectedIdx(null)
    }
  }

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setPermMessage(t('avatar.permCamera'))
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri)
      setSelectedIdx(null)
    }
  }

  const selectEmoji = (idx: number) => {
    setSelectedIdx(idx)
    setPreviewUri(null)
  }

  const handleSave = () => {
    if (previewUri) {
      setAvatarImage(previewUri)
    } else if (selectedIdx !== null) {
      const opt = allAvatars[selectedIdx]
      setAvatarEmoji(opt.emoji, opt.bg)
    }
    router.back()
  }

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[s.back, { color: theme.accent }]}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>{t('avatar.title')} <Text style={s.titleEm}>{t('avatar.titleEm')}</Text></Text>
        </View>

        {/* Preview */}
        <View style={s.previewArea}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={s.previewImage} />
          ) : selectedIdx !== null ? (
            <View style={[s.previewCircle, { backgroundColor: allAvatars[selectedIdx].bg }]}>
              <Text style={s.previewEmoji}>{allAvatars[selectedIdx].emoji}</Text>
            </View>
          ) : (
            <View style={[s.previewCircle, { backgroundColor: theme.accent }]}>
              <Text style={s.previewEmoji}>👤</Text>
            </View>
          )}
        </View>

        {/* Upload options */}
        <View style={s.uploadGrid}>
          <TouchableOpacity style={[s.uploadCard, {
            backgroundColor: theme.dark ? theme.surface : theme.white,
            borderColor: theme.border,
          }]} onPress={pickFromGallery}>
            <ImageIcon size={18} color={theme.text} />
            <View>
              <Text style={[s.uploadName, { color: theme.text }]}>{t('avatar.gallery')}</Text>
              <Text style={[s.uploadDesc, { color: theme.muted }]}>{t('avatar.gallery.sub')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.uploadCard, {
            backgroundColor: theme.dark ? theme.surface : theme.white,
            borderColor: theme.border,
          }]} onPress={pickFromCamera}>
            <CameraIcon size={18} color={theme.text} />
            <View>
              <Text style={[s.uploadName, { color: theme.text }]}>{t('avatar.camera')}</Text>
              <Text style={[s.uploadDesc, { color: theme.muted }]}>{t('avatar.camera.sub')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>{t('avatar.pick')}</Text>

        {/* Avatar grid */}
        <View style={s.avatarGrid}>
          {allAvatars.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                s.avatarCircle,
                { backgroundColor: opt.bg },
                selectedIdx === i && !previewUri && { borderColor: colors.yellow, borderWidth: 3 },
              ]}
              onPress={() => selectEmoji(i)}
            >
              <Text style={s.avatarEmoji}>{opt.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <View style={s.saveArea}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>{t('avatar.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={!!permMessage}
        onClose={() => setPermMessage(null)}
        title={t('avatar.permTitle')}
        message={permMessage || ''}
        confirmText="OK"
        cancelText={t('tasks.action.cancel')}
        onConfirm={() => {}}
      />
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingBottom: 40 },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    back: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      marginBottom: 16,
    },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 26,
      color: theme.text,
    },
    titleEm: {
      fontFamily: typography.serifItalic,
      color: theme.accent,
    },
    previewArea: {
      alignItems: 'center',
      marginBottom: 20,
    },
    previewCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewEmoji: { fontSize: 36 },
    previewImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    uploadGrid: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    uploadCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 12,
    },
    uploadName: {
      fontFamily: typography.sansBold,
      fontSize: 13,
    },
    uploadDesc: {
      fontFamily: typography.sans,
      fontSize: 11,
    },
    sectionLabel: {
      fontFamily: typography.sansBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.muted,
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
    },
    avatarEmoji: { fontSize: 24 },
    saveArea: {
      paddingHorizontal: 14,
    },
    saveBtn: {
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    saveBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: theme.white,
    },
  })
