import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { Profile, Task, NotificationsConfig, EnergyLevel } from '../types'
import { supabase } from '../lib/supabase'

function detectLanguage(): 'es' | 'en' {
  try {
    const locale = getLocales()[0]?.languageCode ?? 'en'
    return locale === 'es' ? 'es' : 'en'
  } catch {
    return 'en'
  }
}

export type AppearanceMode = 'system' | 'light' | 'dark'
export type AppLanguage = 'es' | 'en'

interface AppState {
  // Auth
  profile: Profile | null
  setProfile: (profile: Profile | null) => void
  userEmail: string | null
  setUserEmail: (email: string | null) => void

  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  completeTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'category' | 'energy_levels'>>) => void
  restoreTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  skipTask: (taskId: string) => void

  // Current energy state
  selectedEnergy: EnergyLevel[]
  setSelectedEnergy: (levels: EnergyLevel[]) => void

  // Current assigned task
  currentTask: Task | null
  isAltTask: boolean // true if it's a fallback suggestion
  skippedTaskIds: string[]
  setCurrentTask: (task: Task | null, isAlt?: boolean) => void
  resetSkipped: () => void

  // Notifications
  notificationsConfig: NotificationsConfig | null
  setNotificationsConfig: (config: NotificationsConfig) => void
  notifSettings: {
    fixedEnabled: boolean
    morningOn: boolean
    eveningOn: boolean
    morningH: number
    morningM: number
    eveningH: number
    eveningM: number
    smartEnabled: boolean
  }
  setNotifSettings: (s: Partial<AppState['notifSettings']>) => void

  // Onboarding
  hasSeenOnboarding: boolean
  setHasSeenOnboarding: () => void

  // Trial
  trialActivated: boolean
  trialActivatedAt: string | null
  activateTrial: () => void

  // Account nudge
  tasksCreatedWithoutAccount: number
  incrementTasksCreated: () => void
  lastNudgeDismissedAt: string | null
  dismissNudge: () => void

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
  fetchTaskForEnergy: (levels: EnergyLevel[], excludeTaskId?: string) => Promise<void>
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  userEmail: null,
  setUserEmail: (email) => set({ userEmail: email }),

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
  restoreTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: false, completed_at: null } : t
      ),
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
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
        skippedTaskIds: [...state.skippedTaskIds, taskId],
      }
    })
  },

  selectedEnergy: [],
  setSelectedEnergy: (levels) => set({ selectedEnergy: levels }),

  currentTask: null,
  isAltTask: false,
  skippedTaskIds: [],
  setCurrentTask: (task, isAlt = false) =>
    set({ currentTask: task, isAltTask: isAlt }),
  resetSkipped: () => set({ skippedTaskIds: [] }),

  notificationsConfig: null,
  setNotificationsConfig: (config) => set({ notificationsConfig: config }),
  notifSettings: {
    fixedEnabled: true,
    morningOn: true,
    eveningOn: true,
    morningH: 10,
    morningM: 0,
    eveningH: 18,
    eveningM: 0,
    smartEnabled: false,
  },
  setNotifSettings: (updates) => set((state) => ({
    notifSettings: { ...state.notifSettings, ...updates },
  })),

  hasSeenOnboarding: false,
  setHasSeenOnboarding: () => set({ hasSeenOnboarding: true }),

  trialActivated: false,
  trialActivatedAt: null,
  activateTrial: () => set({
    trialActivated: true,
    trialActivatedAt: new Date().toISOString(),
  }),

  tasksCreatedWithoutAccount: 0,
  incrementTasksCreated: () => set((s) => ({
    tasksCreatedWithoutAccount: s.tasksCreatedWithoutAccount + 1,
  })),
  lastNudgeDismissedAt: null,
  dismissNudge: () => set({ lastNudgeDismissedAt: new Date().toISOString() }),

  appearanceMode: 'system',
  setAppearanceMode: (mode) => set({ appearanceMode: mode }),
  language: detectLanguage(),
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

  fetchTaskForEnergy: async (levels: EnergyLevel[], excludeTaskId?: string) => {
    if (levels.length === 0) return

    // Try Supabase first, fall back to local tasks
    let pending: Task[]
    try {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*, task_energy_levels(energy_level)')
        .eq('completed', false)
        .order('position', { ascending: true })

      if (allTasks && allTasks.length > 0) {
        pending = allTasks.map((t: any) => ({
          ...t,
          energy_levels: t.task_energy_levels.map((el: any) => el.energy_level),
        }))
      } else {
        pending = get().tasks.filter((t) => !t.completed)
      }
    } catch {
      pending = get().tasks.filter((t) => !t.completed)
    }

    // Exclude all skipped tasks in this session
    const skipped = get().skippedTaskIds
    const allExcluded = excludeTaskId ? [...skipped, excludeTaskId] : skipped
    if (allExcluded.length > 0) {
      pending = pending.filter((t) => !allExcluded.includes(t.id))
    }

    if (pending.length === 0) {
      set({ currentTask: null, isAltTask: false })
      return
    }

    // 1. Exact match: task has ALL selected energy levels
    const exactMatch = pending.find((t) =>
      t.energy_levels && t.energy_levels.length > 0 &&
      levels.every((l) => t.energy_levels!.includes(l))
    )
    if (exactMatch) {
      set({ currentTask: exactMatch, isAltTask: false, selectedEnergy: levels })
      return
    }

    // 2. Partial match: task has AT LEAST ONE matching level
    const partialMatch = pending.find((t) =>
      t.energy_levels && t.energy_levels.length > 0 &&
      levels.some((l) => t.energy_levels!.includes(l))
    )
    if (partialMatch) {
      set({ currentTask: partialMatch, isAltTask: true, selectedEnergy: levels })
      return
    }

    // 3. Any pending task (no energy match, but still something to do)
    set({ currentTask: pending[0], isAltTask: true, selectedEnergy: levels })
  },
}), {
  name: 'ahora-o-nunca-store',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    userEmail: state.userEmail,
    hasSeenOnboarding: state.hasSeenOnboarding,
    trialActivated: state.trialActivated,
    trialActivatedAt: state.trialActivatedAt,
    notifSettings: state.notifSettings,
    tasksCreatedWithoutAccount: state.tasksCreatedWithoutAccount,
    lastNudgeDismissedAt: state.lastNudgeDismissedAt,
    appearanceMode: state.appearanceMode,
    language: state.language,
    avatarEmoji: state.avatarEmoji,
    avatarBg: state.avatarBg,
    avatarImageUri: state.avatarImageUri,
    tasks: state.tasks,
  }),
}))
