import React from 'react'
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native'
import { useAppStore } from '../lib/store'
import { colors } from '../lib/theme'
import { UserIcon } from './Icons'

interface AvatarButtonProps {
  onPress: () => void
  size?: number
}

export function AvatarButton({ onPress, size = 30 }: AvatarButtonProps) {
  const profile = useAppStore((s) => s.profile)
  const avatarEmoji = useAppStore((s) => s.avatarEmoji)
  const avatarBg = useAppStore((s) => s.avatarBg)
  const avatarImageUri = useAppStore((s) => s.avatarImageUri)

  const r = size / 2

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { width: size, height: size, borderRadius: r }]}
    >
      {avatarImageUri ? (
        <Image
          source={{ uri: avatarImageUri }}
          style={{ width: size, height: size, borderRadius: r }}
        />
      ) : avatarEmoji ? (
        <View style={[styles.emojiCircle, {
          width: size, height: size, borderRadius: r,
          backgroundColor: avatarBg || colors.accent,
        }]}>
          <Text style={{ fontSize: size * 0.5 }}>{avatarEmoji}</Text>
        </View>
      ) : profile?.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={{ width: size, height: size, borderRadius: r }}
        />
      ) : (
        <View style={[styles.placeholder, {
          width: size, height: size, borderRadius: r,
        }]}>
          <UserIcon size={size * 0.55} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  emojiCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
