import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAppStore } from '../src/lib/store'
import HomeScreen from '../src/screens/HomeScreen'

function injectSystemTasks() {
  const state = useAppStore.getState()
  const { tasks, userEmail, avatarEmoji, avatarImageUri, notifSettings, addTask } = state
  const lang = state.language

  const systemTasks: { id: string; textEs: string; textEn: string; minutes: number; shouldExist: boolean }[] = [
    {
      id: 'system_create_account',
      textEs: 'Crear tu cuenta',
      textEn: 'Create your account',
      minutes: 2,
      shouldExist: !userEmail,
    },
    {
      id: 'system_pick_avatar',
      textEs: 'Elige tu avatar',
      textEn: 'Pick your avatar',
      minutes: 1,
      shouldExist: !avatarEmoji && !avatarImageUri,
    },
    {
      id: 'system_setup_notifs',
      textEs: 'Configura tus notificaciones',
      textEn: 'Set up your notifications',
      minutes: 2,
      shouldExist: !notifSettings.morningOn && !notifSettings.eveningOn && !notifSettings.smartEnabled,
    },
  ]

  for (const st of systemTasks) {
    const exists = tasks.find((t) => t.id === st.id)

    if (st.shouldExist && !exists) {
      addTask({
        id: st.id,
        user_id: 'system',
        text: lang === 'en' ? st.textEn : st.textEs,
        category: 'personal',
        position: -1,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        energy_levels: ['calm', 'mobile_only', 'short_time'],
        estimated_minutes: st.minutes,
        recurrence: null,
        recurrence_day: null,
      })
    }

    if (!st.shouldExist && exists && !exists.completed) {
      useAppStore.setState({
        tasks: useAppStore.getState().tasks.filter((t) => t.id !== st.id),
      })
    }
  }
}

export default function Index() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to let persist hydrate
    const timer = setTimeout(() => {
      setReady(true)
      injectSystemTasks()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (ready && !hasSeenOnboarding) {
      router.replace('/onboarding')
    }
  }, [ready, hasSeenOnboarding])

  if (!ready || !hasSeenOnboarding) return null

  return <HomeScreen />
}
