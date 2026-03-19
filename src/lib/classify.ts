import { supabase } from './supabase'
import { Category, EnergyLevel } from '../types'

interface ClassifyResult {
  category: Category | null
  energyLevels: EnergyLevel[]
}

/**
 * Calls the Supabase Edge Function that uses Claude to classify a task.
 * Falls back to null if the function is not deployed or fails.
 */
export async function classifyTask(text: string): Promise<ClassifyResult> {
  try {
    const { data, error } = await supabase.functions.invoke('classify-task', {
      body: { text },
    })

    if (error || !data) {
      return { category: null, energyLevels: [] }
    }

    // Validate the response
    const validCategories: Category[] = ['home', 'work', 'mobile', 'errands', 'personal']
    const validEnergy: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

    const category = validCategories.includes(data.category) ? data.category : null
    const energyLevels = Array.isArray(data.energyLevels)
      ? data.energyLevels.filter((l: string) => validEnergy.includes(l as EnergyLevel))
      : []

    return { category, energyLevels }
  } catch (_) {
    return { category: null, energyLevels: [] }
  }
}
