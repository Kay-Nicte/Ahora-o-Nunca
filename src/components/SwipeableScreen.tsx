import React, { useRef } from 'react'
import { View, PanResponder } from 'react-native'
import { router } from 'expo-router'
import { getSwipeRoute } from './BottomNav'

type NavTab = 'home' | 'tasks' | 'add'

interface Props {
  activeTab: NavTab
  children: React.ReactNode
}

export function SwipeableScreen({ activeTab, children }: Props) {
  const startX = useRef(0)

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dy) < 40,
      onPanResponderGrant: (_, gesture) => {
        startX.current = gesture.x0
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < 80) return
        const direction = gesture.dx > 0 ? 'right' : 'left'
        const route = getSwipeRoute(activeTab, direction)
        if (route) router.replace(route as any)
      },
    })
  ).current

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  )
}
