import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { BoltIcon, ListIcon, MicIcon } from './Icons'
import { typography } from '../lib/theme'
import { useT } from '../lib/i18n'

type NavTab = 'home' | 'tasks' | 'add'

const TAB_CONFIG: { key: NavTab; labelKey: string; icon: typeof BoltIcon; route: string }[] = [
  { key: 'home', labelKey: 'nav.now', icon: BoltIcon, route: '/' },
  { key: 'tasks', labelKey: 'nav.tasks', icon: ListIcon, route: '/tasks' },
  { key: 'add', labelKey: 'nav.add', icon: MicIcon, route: '/add-task' },
]

// Map tab index for swipe
const TAB_ORDER: NavTab[] = ['home', 'tasks', 'add']

interface BottomNavProps {
  active: NavTab
}

export function BottomNav({ active }: BottomNavProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const t = useT()

  return (
    <View style={[styles.nav, {
      backgroundColor: theme.dark ? theme.surface : '#fff',
      borderTopColor: theme.border,
      paddingBottom: Math.max(insets.bottom, 12),
    }]}>
      {TAB_CONFIG.map(({ key, labelKey, icon: Icon, route }) => {
        const label = t(labelKey as any)
        const isActive = active === key
        const color = isActive ? theme.accent : theme.muted
        return (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => router.replace(route as any)}
          >
            <Icon size={20} color={color} />
            <Text style={[styles.label, { color, fontFamily: typography.sansBold }]}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// Helper: get adjacent tab route for swipe
export function getSwipeRoute(current: NavTab, direction: 'left' | 'right'): string | null {
  const idx = TAB_ORDER.indexOf(current)
  if (direction === 'left' && idx < TAB_ORDER.length - 1) {
    return TAB_CONFIG[idx + 1].route
  }
  if (direction === 'right' && idx > 0) {
    return TAB_CONFIG[idx - 1].route
  }
  return null
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
