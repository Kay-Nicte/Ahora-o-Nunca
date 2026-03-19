import { supabase } from './supabase'
import { Category, EnergyLevel } from '../types'
import { classifyLocally } from './classifyLocal'

interface ClassifyResult {
  category: Category | null
  energyLevels: EnergyLevel[]
}

/**
 * Classify a task. Tries Supabase Edge Function (Claude) first,
 * falls back to local keyword rules.
 */
export async function classifyTask(text: string): Promise<ClassifyResult> {
  // Try remote (Claude) first
  try {
    const { data, error } = await supabase.functions.invoke('classify-task', {
      body: { text },
    })

    if (!error && data) {
      const validCategories: Category[] = ['home', 'work', 'mobile', 'errands', 'personal']
      const validEnergy: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

      const category = validCategories.includes(data.category) ? data.category : null
      const energyLevels = Array.isArray(data.energyLevels)
        ? data.energyLevels.filter((l: string) => validEnergy.includes(l as EnergyLevel))
        : []

      if (category || energyLevels.length > 0) {
        return { category, energyLevels }
      }
    }
  } catch (_) {}

  // Fallback: local keyword matching
  return classifyLocally(text)
}
