import * as Notifications from 'expo-notifications'

let handlerConfigured = false

/** Call this only after the user has granted permission */
function ensureHandler() {
  if (handlerConfigured) return
  handlerConfigured = true
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

export async function checkNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') {
    ensureHandler()
    return true
  }

  const { status } = await Notifications.requestPermissionsAsync()
  if (status === 'granted') {
    ensureHandler()
    return true
  }
  return false
}

/**
 * Schedule daily notification at a specific hour:minute.
 * identifier is used to cancel/replace it later.
 */
export async function scheduleDailyNotification(
  identifier: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
) {
  ensureHandler()
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {})

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export async function cancelNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {})
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
