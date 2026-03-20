import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useT } from '../lib/i18n'
import { scheduleDailyNotification } from '../lib/notifications'
import { typography, radius, spacing } from '../lib/theme'
import * as Notifications from 'expo-notifications'

interface RemindMeProps {
  visible: boolean
}

export function RemindMe({ visible }: RemindMeProps) {
  const t = useT()
  const [set, setSet] = useState(false)

  if (!visible || set) {
    return set ? (
      <Text style={s.confirmText}>{t('task.remind.set')}</Text>
    ) : null
  }

  const scheduleReminder = async (minutes: number) => {
    try {
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync()
        if (newStatus !== 'granted') return
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      })

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('task.remind.push.title'),
          body: t('task.remind.push.body'),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: minutes * 60,
        },
      })
      setSet(true)
    } catch (_) {}
  }

  return (
    <View style={s.container}>
      <Text style={s.label}>{t('task.remindMe')}</Text>
      <View style={s.options}>
        <TouchableOpacity style={s.option} onPress={() => scheduleReminder(15)}>
          <Text style={s.optionText}>{t('task.remind.15')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.option} onPress={() => scheduleReminder(30)}>
          <Text style={s.optionText}>{t('task.remind.30')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.option} onPress={() => scheduleReminder(60)}>
          <Text style={s.optionText}>{t('task.remind.60')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.option} onPress={() => setSet(true)}>
          <Text style={[s.optionText, { opacity: 0.5 }]}>{t('task.remind.no')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  label: {
    fontFamily: typography.serifItalic,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionText: {
    fontFamily: typography.sansBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  confirmText: {
    fontFamily: typography.serifItalic,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: spacing.md,
  },
})
