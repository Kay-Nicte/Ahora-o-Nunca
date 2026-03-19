import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAppStore } from '../src/lib/store'
import HomeScreen from '../src/screens/HomeScreen'

export default function Index() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to let persist hydrate
    const timer = setTimeout(() => setReady(true), 100)
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
