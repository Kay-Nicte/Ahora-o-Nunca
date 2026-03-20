export interface Reward {
  id: string
  type: 'avatar' | 'title' | 'background'
  threshold: number // total tasks needed
  value: string // emoji for avatar, label key for title, hex for background
  label_es: string
  label_en: string
}

export const REWARDS: Reward[] = [
  // Titles (milestones)
  { id: 'title_1', type: 'title', threshold: 1, value: 'first_step', label_es: 'Primer paso', label_en: 'First step' },
  { id: 'title_5', type: 'title', threshold: 5, value: 'getting_started', label_es: 'Arrancando', label_en: 'Getting started' },
  { id: 'title_15', type: 'title', threshold: 15, value: 'on_a_roll', label_es: 'En racha', label_en: 'On a roll' },
  { id: 'title_30', type: 'title', threshold: 30, value: 'unstoppable', label_es: 'Imparable', label_en: 'Unstoppable' },
  { id: 'title_50', type: 'title', threshold: 50, value: 'legend', label_es: 'Leyenda', label_en: 'Legend' },
  { id: 'title_100', type: 'title', threshold: 100, value: 'master', label_es: 'Maestra', label_en: 'Master' },

  // Avatars (unlock new emoji avatars)
  { id: 'avatar_3', type: 'avatar', threshold: 3, value: '🐺', label_es: 'Lobo', label_en: 'Wolf' },
  { id: 'avatar_10', type: 'avatar', threshold: 10, value: '🦅', label_es: 'Águila', label_en: 'Eagle' },
  { id: 'avatar_20', type: 'avatar', threshold: 20, value: '🐉', label_es: 'Dragón', label_en: 'Dragon' },
  { id: 'avatar_40', type: 'avatar', threshold: 40, value: '🦄', label_es: 'Unicornio', label_en: 'Unicorn' },
  { id: 'avatar_75', type: 'avatar', threshold: 75, value: '🌟', label_es: 'Estrella', label_en: 'Star' },

  // Background colors (unlock for profile)
  { id: 'bg_7', type: 'background', threshold: 7, value: '#4a6741', label_es: 'Bosque', label_en: 'Forest' },
  { id: 'bg_12', type: 'background', threshold: 12, value: '#6b4a7a', label_es: 'Anochecer', label_en: 'Dusk' },
  { id: 'bg_25', type: 'background', threshold: 25, value: '#7a5c3a', label_es: 'Tierra', label_en: 'Earth' },
  { id: 'bg_35', type: 'background', threshold: 35, value: '#3a5c7a', label_es: 'Océano', label_en: 'Ocean' },
  { id: 'bg_60', type: 'background', threshold: 60, value: '#7a3a4a', label_es: 'Aurora', label_en: 'Aurora' },
]

export function getLevel(totalCompleted: number): { level: number; title_es: string; title_en: string; next: number | null } {
  const titles = REWARDS.filter((r) => r.type === 'title').sort((a, b) => b.threshold - a.threshold)

  for (let i = 0; i < titles.length; i++) {
    if (totalCompleted >= titles[i].threshold) {
      const nextTitle = i > 0 ? titles[i - 1] : null
      return {
        level: titles.length - i,
        title_es: titles[i].label_es,
        title_en: titles[i].label_en,
        next: nextTitle ? nextTitle.threshold : null,
      }
    }
  }

  return { level: 0, title_es: 'Empezando', title_en: 'Starting', next: titles[titles.length - 1]?.threshold ?? 1 }
}

export function getNewUnlocks(totalCompleted: number, alreadyUnlocked: string[]): Reward[] {
  return REWARDS.filter((r) =>
    totalCompleted >= r.threshold && !alreadyUnlocked.includes(r.id)
  )
}
