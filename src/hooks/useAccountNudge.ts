import { useAppStore } from '../lib/store'
import { usePremium } from './usePremium'

const TASKS_THRESHOLD = 3
const NUDGE_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

export function useAccountNudge() {
  const profile = useAppStore((s) => s.profile)
  const tasksCreated = useAppStore((s) => s.tasksCreatedWithoutAccount)
  const lastDismissed = useAppStore((s) => s.lastNudgeDismissedAt)
  const { isTrial, trialDaysLeft } = usePremium()

  // Already has account
  if (profile?.id && profile.id !== 'local') return { showNudge: false, reason: null as string | null }

  // Check cooldown: if dismissed recently, don't show
  if (lastDismissed) {
    const elapsed = Date.now() - new Date(lastDismissed).getTime()
    if (elapsed < NUDGE_COOLDOWN_MS) return { showNudge: false, reason: null as string | null }
  }

  // Reason 1: trial ending soon (day 5-6-7)
  if (isTrial && trialDaysLeft <= 2) {
    return { showNudge: true, reason: 'trial_ending' as const }
  }

  // Reason 2: enough tasks created without account
  if (tasksCreated >= TASKS_THRESHOLD) {
    return { showNudge: true, reason: 'tasks_at_risk' as const }
  }

  return { showNudge: false, reason: null as string | null }
}
