// =============================================
// AHORA O NUNCA — Types
// =============================================

export type EnergyLevel = 'high' | 'calm' | 'short_time' | 'mobile_only'

export type Category = 'home' | 'work' | 'mobile' | 'errands' | 'personal'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  is_premium: boolean
  premium_since: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  text: string
  category: Category | null
  position: number
  completed: boolean
  completed_at: string | null
  created_at: string
  energy_levels?: EnergyLevel[]
  estimated_minutes?: number | null
}

export interface TaskEnergyLevel {
  id: string
  task_id: string
  energy_level: EnergyLevel
}

export interface NotificationsConfig {
  id: string
  user_id: string
  fixed_enabled: boolean
  fixed_time_morning: string
  fixed_time_evening: string
  smart_enabled: boolean
}

// UI helpers
export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  high: 'Con energía',
  calm: 'Tranquila',
  short_time: 'Poco tiempo',
  mobile_only: 'Solo el móvil',
}

export const ENERGY_SYMBOLS: Record<EnergyLevel, string> = {
  high: '→',
  calm: '~',
  short_time: '·',
  mobile_only: '○',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  home: 'Casa',
  work: 'Trabajo',
  mobile: 'Móvil',
  errands: 'Recados',
  personal: 'Personal',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  home: '#c4836a',
  work: '#7a9e7e',
  mobile: '#9b8ec4',
  errands: '#c49a5c',
  personal: '#e07a7a',
}
