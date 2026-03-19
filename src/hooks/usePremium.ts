import { useAppStore } from '../lib/store'

const TRIAL_DAYS = 7

export function usePremium() {
  const profile = useAppStore((s) => s.profile)
  const trialActivated = useAppStore((s) => s.trialActivated)
  const trialActivatedAt = useAppStore((s) => s.trialActivatedAt)

  // Paid premium from profile
  if (profile?.is_premium) {
    return { isPremium: true, isTrial: false, trialDaysLeft: 0, trialUsed: trialActivated, showTrialBanner: false }
  }

  // Trial active?
  if (trialActivated && trialActivatedAt) {
    const start = new Date(trialActivatedAt).getTime()
    const now = Date.now()
    const elapsed = now - start
    const daysLeft = Math.max(0, TRIAL_DAYS - Math.floor(elapsed / (1000 * 60 * 60 * 24)))

    if (daysLeft > 0) {
      return { isPremium: true, isTrial: true, trialDaysLeft: daysLeft, trialUsed: true, showTrialBanner: false }
    }

    // Trial expired
    return { isPremium: false, isTrial: false, trialDaysLeft: 0, trialUsed: true, showTrialBanner: false }
  }

  // Never activated trial — show banner
  return { isPremium: false, isTrial: false, trialDaysLeft: 0, trialUsed: false, showTrialBanner: true }
}
