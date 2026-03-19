import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { ENERGY_EMOJIS } from '../types'
import { useT } from '../lib/i18n'
import { spacing, radius, typography } from '../lib/theme'
import { AvatarButton } from '../components/AvatarButton'
import { BottomNav } from '../components/BottomNav'
import { SwipeableScreen } from '../components/SwipeableScreen'
import { ConfirmModal } from '../components/ConfirmModal'

export default function TaskListScreen() {
  const theme = useTheme()
  const t = useT()
  const tasks = useAppStore((s) => s.tasks)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const { fetchTasks, markComplete } = useTasks()
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const pendingTasks = tasks.filter((tk) => !tk.completed)

  const s = styles(theme)

  return (
    <SwipeableScreen activeTab="tasks">
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.title}>{t('tasks.title')} <Text style={s.titleEm}>{t('tasks.titleEm')}</Text></Text>
            <AvatarButton onPress={() => router.push('/profile')} />
          </View>
          <Text style={s.sub}>
            {pendingTasks.length} {pendingTasks.length !== 1 ? t('tasks.pending_other') : t('tasks.pending_one')}
          </Text>
        </View>

        <ScrollView style={s.list} contentContainerStyle={s.listContent}>
          {pendingTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[s.taskItem, {
                backgroundColor: theme.dark ? theme.surface : '#fff',
                borderColor: theme.border,
              }]}
              onPress={() => markComplete(task.id)}
              onLongPress={() => setTaskToDelete(task.id)}
              activeOpacity={0.7}
            >
              <View style={[s.taskCheck, { borderColor: theme.accent }]} />
              <View style={s.taskInfo}>
                <Text style={[s.taskName, { color: theme.text }]}>{task.text}</Text>
                {task.energy_levels && task.energy_levels.length > 0 && (
                  <Text style={[s.taskMeta, { color: theme.muted }]}>
                    {task.energy_levels.map((l) => ENERGY_EMOJIS[l]).join(' ')}
                  </Text>
                )}
              </View>
              {task.category && (
                <View style={s.catBadge}>
                  <Text style={s.catBadgeText}>{t(`cat.${task.category}` as any)}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {pendingTasks.length === 0 && (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.muted }]}>
                {t('tasks.empty')}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={s.addArea}>
          <TouchableOpacity
            style={[s.addBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/add-task')}
          >
            <View style={[s.micDot, { backgroundColor: theme.accent }]} />
            <Text style={[s.addBtnText, { color: theme.muted }]}>{t('tasks.new')}</Text>
          </TouchableOpacity>
        </View>

        <ConfirmModal
          visible={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          title={t('tasks.action.delete')}
          confirmText={t('tasks.action.delete')}
          cancelText={t('tasks.action.cancel')}
          onConfirm={() => { if (taskToDelete) deleteTask(taskToDelete) }}
          destructive
        />
        <BottomNav active="tasks" />
      </SafeAreaView>
    </SwipeableScreen>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 10,
      backgroundColor: theme.surface,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    title: {
      fontFamily: typography.serif,
      fontSize: 26,
      color: theme.text,
    },
    titleEm: {
      fontFamily: typography.serifItalic,
      color: theme.dark ? '#6b8ed9' : theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.muted,
    },
    list: { flex: 1 },
    listContent: { paddingTop: 8 },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 10,
      paddingHorizontal: 12,
      marginHorizontal: 14,
      marginBottom: 8,
    },
    taskCheck: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
    },
    taskInfo: { flex: 1 },
    taskName: {
      fontFamily: typography.sansBold,
      fontSize: 12,
    },
    taskMeta: {
      fontFamily: typography.sans,
      fontSize: 10,
      marginTop: 2,
    },
    catBadge: {
      backgroundColor: 'rgba(91,126,201,0.15)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    catBadgeText: {
      fontFamily: typography.sansBold,
      fontSize: 9,
      color: theme.accent,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyText: {
      fontFamily: typography.sans,
      fontSize: 13,
    },
    addArea: {
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 12,
    },
    addBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 11,
    },
    micDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  })
