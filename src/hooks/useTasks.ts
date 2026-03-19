import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import { Category, EnergyLevel, Task } from '../types'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useTasks() {
  const { tasks, fetchTasks, fetchTaskForEnergy, completeTask, skipTask, addTask } =
    useAppStore()

  const createTask = async (
    text: string,
    energyLevels: EnergyLevel[],
    category?: Category
  ) => {
    // Try Supabase first
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const maxPosition = tasks.length > 0
          ? Math.max(...tasks.map((t) => t.position))
          : -1

        const { data: task, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            text,
            category: category ?? null,
            position: maxPosition + 1,
          })
          .select()
          .single()

        if (!error && task) {
          if (energyLevels.length > 0) {
            await supabase.from('task_energy_levels').insert(
              energyLevels.map((level) => ({
                task_id: task.id,
                energy_level: level,
              }))
            )
          }
          await fetchTasks()
          return { error: null }
        }
      }
    } catch (_) {
      // Supabase not available, fall through to local
    }

    // Local fallback
    const maxPosition = tasks.length > 0
      ? Math.max(...tasks.map((t) => t.position))
      : -1

    const localTask: Task = {
      id: generateId(),
      user_id: 'local',
      text,
      category: category ?? null,
      position: maxPosition + 1,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      energy_levels: energyLevels,
    }

    addTask(localTask)
    return { error: null }
  }

  const markComplete = async (taskId: string) => {
    // Try Supabase
    try {
      await supabase
        .from('tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', taskId)
    } catch (_) {}

    completeTask(taskId)
    return { error: null }
  }

  const skipAndNext = async (taskId: string, currentLevels: EnergyLevel[]) => {
    try {
      const maxPosition = tasks.length > 0
        ? Math.max(...tasks.map((t) => t.position))
        : 0
      await supabase
        .from('tasks')
        .update({ position: maxPosition + 1 })
        .eq('id', taskId)
    } catch (_) {}

    skipTask(taskId)
    await fetchTaskForEnergy(currentLevels)
  }

  const transcribeAndCategorize = async (_audioUri: string): Promise<{
    text: string
    category: Category | null
    energyLevels: EnergyLevel[]
  }> => {
    return { text: '', category: null, energyLevels: [] }
  }

  return {
    tasks,
    fetchTasks,
    fetchTaskForEnergy,
    createTask,
    markComplete,
    skipAndNext,
    transcribeAndCategorize,
  }
}
