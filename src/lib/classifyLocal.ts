import { Category, EnergyLevel } from '../types'

interface ClassifyResult {
  category: Category | null
  energyLevels: EnergyLevel[]
}

const RULES: { words: string[]; category: Category; energy: EnergyLevel[] }[] = [
  // Home
  { words: ['limpiar', 'clean', 'cocina', 'kitchen', 'barrer', 'fregar', 'sweep', 'mop', 'aspirar', 'vacuum', 'ropa', 'laundry', 'planchar', 'iron', 'basura', 'trash', 'cama', 'bed', 'ordenar', 'tidy'], category: 'home', energy: ['high'] },
  // Work
  { words: ['informe', 'report', 'reunión', 'meeting', 'presentación', 'presentation', 'proyecto', 'project', 'deadline', 'jefe', 'boss', 'oficina', 'office', 'trabajo', 'work'], category: 'work', energy: ['high'] },
  // Mobile / phone tasks
  { words: ['llamar', 'call', 'email', 'correo', 'mensaje', 'message', 'whatsapp', 'responder', 'reply', 'contestar', 'answer', 'pedir cita', 'appointment', 'reservar', 'book'], category: 'mobile', energy: ['mobile_only', 'short_time'] },
  // Errands
  { words: ['comprar', 'buy', 'supermercado', 'grocery', 'farmacia', 'pharmacy', 'banco', 'bank', 'correos', 'post', 'recoger', 'pick up', 'devolver', 'return', 'tienda', 'shop', 'store'], category: 'errands', energy: ['high'] },
  // Personal
  { words: ['médico', 'doctor', 'dentista', 'dentist', 'gimnasio', 'gym', 'ejercicio', 'exercise', 'yoga', 'meditar', 'meditate', 'leer', 'read', 'estudiar', 'study', 'curso', 'course'], category: 'personal', energy: ['calm'] },
]

// Short time indicators
const SHORT_WORDS = ['rápido', 'quick', 'minuto', 'minute', 'segundo', 'second', 'ya', 'now', 'breve', 'brief', 'corto', 'short']

// Calm indicators
const CALM_WORDS = ['tranquilo', 'calm', 'relax', 'suave', 'fácil', 'easy', 'simple', 'poco', 'light', 'leer', 'read', 'ver', 'watch', 'escuchar', 'listen']

export function classifyLocally(text: string): ClassifyResult {
  const lower = text.toLowerCase()

  let category: Category | null = null
  let energy: EnergyLevel[] = []

  // Match rules
  for (const rule of RULES) {
    if (rule.words.some((w) => lower.includes(w))) {
      category = rule.category
      energy = [...rule.energy]
      break
    }
  }

  // Add short_time if short words detected
  if (SHORT_WORDS.some((w) => lower.includes(w)) && !energy.includes('short_time')) {
    energy.push('short_time')
  }

  // Add calm if calm words detected
  if (CALM_WORDS.some((w) => lower.includes(w))) {
    energy = energy.filter((e) => e !== 'high')
    if (!energy.includes('calm')) energy.push('calm')
  }

  // If text is very short (< 5 words), likely a quick task
  if (text.trim().split(/\s+/).length <= 4 && !energy.includes('short_time')) {
    energy.push('short_time')
  }

  return { category, energyLevels: energy }
}
