import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Profile, Task, NotificationsConfig, EnergyLevel } from '../types'
import { supabase } from '../lib/supabase'

export type AppearanceMode = 'system' | 'light' | 'dark'
export type AppLanguage = 'es' | 'en'

interface AppState {
  // Auth
  profile: Profile | null
  setProfile: (profile: Profile | null) => void

  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  completeTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  skipTask: (taskId: string) => void

  // Current energy state
  selectedEnergy: EnergyLevel[]
  setSelectedEnergy: (levels: EnergyLevel[]) => void

  // Current assigned task
  currentTask: Task | null
  isAltTask: boolean // true if it's a fallback suggestion
  setCurrentTask: (task: Task | null, isAlt?: boolean) => void

  // Notifications
  notificationsConfig: NotificationsConfig | null
  setNotificationsConfig: (config: NotificationsConfig) => void

  // Preferences
  appearanceMode: AppearanceMode
  setAppearanceMode: (mode: AppearanceMode) => void
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void

  // Avatar
  avatarEmoji: string | null
  avatarBg: string | null
  avatarImageUri: string | null
  setAvatarEmoji: (emoji: string, bg: string) => void
  setAvatarImage: (uri: string) => void

  // Actions
  fetchTasks: () => Promise<void>
  fetchTaskForEnergy: (levels: EnergyLevel[]) => Promise<void>
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  completeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completed_at: new Date().toISOString() }
          : t
      ),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    })),
  skipTask: (taskId) => {
    // Move task to end of queue
    set((state) => {
      const tasks = [...state.tasks]
      const idx = tasks.findIndex((t) => t.id === taskId)
      if (idx === -1) return state
      const task = tasks[idx]
      const maxPosition = Math.max(...tasks.map((t) => t.position))
      return {
        tasks: tasks.map((t) =>
          t.id === taskId ? { ...t, position: maxPosition + 1 } : t
        ),
      }
    })
  },

  selectedEnergy: [],
  setSelectedEnergy: (levels) => set({ selectedEnergy: levels }),

  currentTask: null,
  isAltTask: false,
  setCurrentTask: (task, isAlt = false) =>
    set({ currentTask: task, isAltTask: isAlt }),

  notificationsConfig: null,
  setNotificationsConfig: (config) => set({ notificationsConfig: config }),

  appearanceMode: 'system',
  setAppearanceMode: (mode) => set({ appearanceMode: mode }),
  language: 'es',
  setLanguage: (lang) => set({ language: lang }),

  avatarEmoji: null,
  avatarBg: null,
  avatarImageUri: null,
  setAvatarEmoji: (emoji, bg) => set({ avatarEmoji: emoji, avatarBg: bg, avatarImageUri: null }),
  setAvatarImage: (uri) => set({ avatarImageUri: uri, avatarEmoji: null, avatarBg: null }),

  fetchTasks: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_energy_levels(energy_level)')
      .eq('completed', false)
      .order('position', { ascending: true })

    if (error || !data) return

    const tasks: Task[] = data.map((t: any) => ({
      ...t,
      energy_levels: t.task_energy_levels.map((el: any) => el.energy_level),
    }))

    set({ tasks })
  },

  fetchTaskForEnergy: async (levels: EnergyLevel[]) => {
    if (levels.length === 0) return

    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*, task_energy_levels(energy_level)')
      .eq('completed', false)
      .order('position', { ascending: true })

    if (!allTasks) return

    const tasks: Task[] = allTasks.map((t: any) => ({
      ...t,
      energy_levels: t.task_energy_levels.map((el: any) => el.energy_level),
    }))

    // Exact match: task has ALL selected energy levels
    const exactMatch = tasks.find((t) =>
      levels.every((l) => t.energy_levels?.includes(l))
    )

    if (exactMatch) {
      set({ currentTask: exactMatch, isAltTask: false })
      return
    }

    // Fallback: task has AT LEAST ONE matching level
    const fallback = tasks.find((t) =>
      levels.some((l) => t.energy_levels?.includes(l))
    )

    if (fallback) {
      set({ currentTask: fallback, isAltTask: true })
      return
    }

    set({ currentTask: null, isAltTask: false })
  },
}), {
  name: 'ahora-o-nunca-store',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    appearanceMode: state.appearanceMode,
    language: state.language,
    avatarEmoji: state.avatarEmoji,
    avatarBg: state.avatarBg,
    avatarImageUri: state.avatarImageUri,
    tasks: state.tasks,
  }),
}))
