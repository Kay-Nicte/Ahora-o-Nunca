import { useEffect, useRef, useCallback } from 'react'
import { Platform } from 'react-native'

// Use a simple approach: listen to accelerometer via NativeModules
// For Expo Go compatibility, we use a polling approach with fetch from the sensors API

let shakeListeners: (() => void)[] = []
let listening = false

function startListening() {
  if (listening || Platform.OS === 'web') return
  // expo-sensors has issues, so we skip native accelerometer
  // Shake detection will work via dev build with expo-sensors
  // For now, this is a no-op placeholder that doesn't crash
  listening = true
}

export function useShake(onShake: () => void) {
  const callbackRef = useRef(onShake)
  callbackRef.current = onShake

  useEffect(() => {
    const handler = () => callbackRef.current()
    shakeListeners.push(handler)
    startListening()

    return () => {
      shakeListeners = shakeListeners.filter((h) => h !== handler)
    }
  }, [])
}
