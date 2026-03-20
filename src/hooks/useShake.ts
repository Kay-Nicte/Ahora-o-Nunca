import { useEffect, useRef } from 'react'
import { Accelerometer } from 'expo-sensors'

const SHAKE_THRESHOLD = 1.8
const COOLDOWN_MS = 1500

export function useShake(onShake: () => void) {
  const lastShake = useRef(0)

  useEffect(() => {
    Accelerometer.setUpdateInterval(100)

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z)
      const now = Date.now()

      if (total > SHAKE_THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
        lastShake.current = now
        onShake()
      }
    })

    return () => subscription.remove()
  }, [onShake])
}
