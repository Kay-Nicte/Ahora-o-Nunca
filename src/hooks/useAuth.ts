import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'

async function migrateLocalTasks(userId: string) {
  const tasks = useAppStore.getState().tasks
  const localTasks = tasks.filter((t) => t.user_id === 'local')

  if (localTasks.length === 0) return

  for (const task of localTasks) {
    try {
      const { data: inserted } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          text: task.text,
          category: task.category,
          position: task.position,
          completed: task.completed,
          completed_at: task.completed_at,
        })
        .select()
        .single()

      if (inserted && task.energy_levels && task.energy_levels.length > 0) {
        await supabase.from('task_energy_levels').insert(
          task.energy_levels.map((level) => ({
            task_id: inserted.id,
            energy_level: level,
          }))
        )
      }
    } catch (_) {
      // If Supabase isn't set up yet, tasks stay local — no data loss
    }
  }

  // Update local tasks with the real user_id so they don't migrate again
  useAppStore.setState({
    tasks: tasks.map((t) =>
      t.user_id === 'local' ? { ...t, user_id: userId } : t
    ),
  })
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const setProfile = useAppStore((s) => s.setProfile)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        migrateLocalTasks(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          fetchProfile(session.user.id)
          migrateLocalTasks(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { session, loading, signUp, signIn, signOut }
}
