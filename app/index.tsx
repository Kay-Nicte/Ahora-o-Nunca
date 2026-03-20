import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAppStore } from '../src/lib/store'
import HomeScreen from '../src/screens/HomeScreen'

const SYSTEM_TASK_ID = 'system_create_account'

function injectSystemTasks() {
  const { tasks, userEmail, addTask } = useAppStore.getState()

  // If no account and task doesn't exist yet, create it
  if (!userEmail && !tasks.find((t) => t.id === SYSTEM_TASK_ID)) {
    const language = useAppStore.getState().language
    const text = language === 'en' ? 'Create your account' : 'Crear tu cuenta'

    addTask({
      id: SYSTEM_TASK_ID,
      user_id: 'system',
      text,
      category: 'personal',
      position: -1, // appears first
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      energy_levels: ['calm', 'mobile_only', 'short_time'],
      estimated_minutes: 2,
      recurrence: null,
      recurrence_day: null,
    })
  }

  // If account exists, remove the system task
  if (userEmail) {
    const systemTask = tasks.find((t) => t.id === SYSTEM_TASK_ID)
    if (systemTask && !systemTask.completed) {
      useAppStore.setState({
        tasks: tasks.filter((t) => t.id !== SYSTEM_TASK_ID),
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
