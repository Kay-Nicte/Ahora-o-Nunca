import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Pressable, TextInput, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { useTasks } from '../hooks/useTasks'
import { Category, EnergyLevel, Task, CATEGORY_COLORS } from '../types'
import { BoltIcon, FeatherIcon, ClockIcon, SmartphoneIcon } from '../components/Icons'

const ENERGY_ICON_MAP: Record<EnergyLevel, typeof BoltIcon> = {
  high: BoltIcon,
  calm: FeatherIcon,
  short_time: ClockIcon,
  mobile_only: SmartphoneIcon,
}
import { useT } from '../lib/i18n'
import { spacing, radius, typography, colors } from '../lib/theme'
import { AvatarButton } from '../components/AvatarButton'
import { BottomNav } from '../components/BottomNav'
import { SwipeableScreen } from '../components/SwipeableScreen'
import { ConfirmModal } from '../components/ConfirmModal'
import { QuickCapture } from '../components/QuickCapture'
import { tapSuccess, tapWarning, tapLight } from '../lib/haptics'
import { TrialBanner } from '../components/TrialBanner'

const CATEGORIES: Category[] = ['home', 'work', 'mobile', 'errands', 'personal']
const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

export default function TaskListScreen() {
  const theme = useTheme()
  const t = useT()
  const tasks = useAppStore((s) => s.tasks)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const restoreTask = useAppStore((s) => s.restoreTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const { fetchTasks, markComplete } = useTasks()

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [actionTask, setActionTask] = useState<Task | null>(null)
  const [completedActionTask, setCompletedActionTask] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [editText, setEditText] = useState('')
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editEnergy, setEditEnergy] = useState<EnergyLevel[]>([])
  const [showCompleted, setShowCompleted] = useState(false)

  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTasks()
    setRefreshing(false)
  }

  const pendingTasks = tasks.filter((tk) => !tk.completed)
  const completedTasks = tasks.filter((tk) => tk.completed)

  const openEdit = (task: Task) => {
    setActionTask(null)
    setEditTask(task)
    setEditText(task.text)
    setEditCategory(task.category)
    setEditEnergy(task.energy_levels || [])
  }

  const saveEdit = () => {
    if (!editTask || !editText.trim()) return
    updateTask(editTask.id, {
      text: editText.trim(),
      category: editCategory,
      energy_levels: editEnergy,
    })
    setEditTask(null)
  }

  const toggleEnergy = (level: EnergyLevel) => {
    setEditEnergy((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  const s = styles(theme)

  const renderTask = (task: Task, completed = false) => (
    <TouchableOpacity
      key={task.id}
      style={[s.taskItem, completed && s.taskItemCompleted, {
        backgroundColor: theme.dark ? theme.surface : '#fff',
        borderColor: theme.border,
      }]}
      onPress={completed ? undefined : () => { tapSuccess(); markComplete(task.id) }}
      onLongPress={() => { tapWarning(); completed ? setCompletedActionTask(task.id) : setActionTask(task) }}
      activeOpacity={0.7}
    >
      <View style={[
        s.taskCheck,
        { borderColor: theme.accent },
        completed && { backgroundColor: theme.accent },
      ]}>
        {completed && <Text style={s.checkMark}>✓</Text>}
      </View>
      <View style={s.taskInfo}>
        <Text style={[s.taskName, completed && s.taskNameDone, { color: completed ? theme.muted : theme.text }]}>
          {task.text}
        </Text>
        <View style={s.taskMetaRow}>
          {!completed && task.energy_levels && task.energy_levels.length > 0 &&
            task.energy_levels.map((l) =>
              React.createElement(ENERGY_ICON_MAP[l], { key: l, size: 12, color: theme.muted })
            )
          }
          {task.recurrence && (
            <Text style={[s.recurrenceBadge, { color: theme.muted }]}>
              ↻
            </Text>
          )}
        </View>
      </View>
      {task.category && (
        <View style={s.catBadge}>
          <Text style={s.catBadgeText}>{t(`cat.${task.category}` as any)}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

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

        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
        >
          <TrialBanner />
          {pendingTasks.map((task) => renderTask(task))}

          {pendingTasks.length === 0 && (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.muted }]}>{t('tasks.empty')}</Text>
            </View>
          )}

          {completedTasks.length > 0 && (
            <>
              <TouchableOpacity
                style={s.completedHeader}
                onPress={() => setShowCompleted(!showCompleted)}
                activeOpacity={0.7}
              >
                <Text style={[s.completedTitle, { color: theme.muted }]}>
                  {t('tasks.completed')} ({completedTasks.length})
                </Text>
                <Text style={[s.completedArrow, { color: theme.muted }]}>
                  {showCompleted ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {showCompleted && completedTasks.map((task) => renderTask(task, true))}
            </>
          )}
        </ScrollView>

        <View style={s.addArea}>
          <TouchableOpacity
            style={[s.addBtn, { borderColor: theme.accent }]}
            onPress={() => router.push('/add-task')}
          >
            <Text style={[s.addBtnText, { color: theme.accent }]}>{t('tasks.new')}</Text>
          </TouchableOpacity>
        </View>

        {/* Action sheet: Edit / Delete */}
        <Modal
          visible={!!actionTask}
          transparent
          animationType="fade"
          onRequestClose={() => setActionTask(null)}
        >
          <Pressable style={s.sheetBackdrop} onPress={() => setActionTask(null)}>
            <Pressable
              style={[s.sheetCard, { backgroundColor: theme.dark ? theme.surface : '#fff' }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[s.sheetTitle, { color: theme.text }]} numberOfLines={2}>
                {actionTask?.text}
              </Text>

              <TouchableOpacity
                style={[s.sheetBtn, { backgroundColor: theme.accent }]}
                onPress={() => actionTask && openEdit(actionTask)}
              >
                <Text style={s.sheetBtnText}>{t('tasks.action.edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.sheetBtn, { backgroundColor: colors.error }]}
                onPress={() => {
                  if (actionTask) setTaskToDelete(actionTask.id)
                  setActionTask(null)
                }}
              >
                <Text style={s.sheetBtnText}>{t('tasks.action.delete')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sheetCancel} onPress={() => setActionTask(null)}>
                <Text style={[s.sheetCancelText, { color: theme.muted }]}>{t('tasks.action.cancel')}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Edit modal */}
        <Modal
          visible={!!editTask}
          transparent
          animationType="fade"
          onRequestClose={() => setEditTask(null)}
        >
          <Pressable style={s.sheetBackdrop} onPress={() => setEditTask(null)}>
            <Pressable
              style={[s.editCard, { backgroundColor: theme.dark ? theme.surface : '#fff' }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[s.editTitle, { color: theme.text }]}>{t('tasks.edit.title')}</Text>

              <TextInput
                style={[s.editInput, {
                  backgroundColor: theme.dark ? theme.bg : '#f0f2f7',
                  borderColor: theme.border,
                  color: theme.text,
                }]}
                value={editText}
                onChangeText={setEditText}
                autoFocus
              />

              {/* Category chips */}
              <Text style={[s.editLabel, { color: theme.muted }]}>{t('add.category')}</Text>
              <View style={s.chipRow}>
                {CATEGORIES.map((cat) => {
                  const sel = editCategory === cat
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[s.chip, { borderColor: theme.border }, sel && s.chipSel]}
                      onPress={() => setEditCategory(sel ? null : cat)}
                    >
                      <Text style={[s.chipText, { color: theme.muted }, sel && { color: theme.accent }]}>
                        ● {t(`cat.${cat}` as any)}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Energy chips */}
              <Text style={[s.editLabel, { color: theme.muted }]}>{t('home.state')}</Text>
              <View style={s.chipRow}>
                {ENERGY_OPTIONS.map((level) => {
                  const sel = editEnergy.includes(level)
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[s.chip, { borderColor: theme.border }, sel && s.chipSel]}
                      onPress={() => toggleEnergy(level)}
                    >
                      <Text style={[s.chipText, { color: theme.muted }, sel && { color: theme.accent }]}>
                        {t(`energy.${level}` as any)}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <TouchableOpacity
                style={[s.editSaveBtn, { backgroundColor: theme.accent }, !editText.trim() && { opacity: 0.4 }]}
                onPress={saveEdit}
                disabled={!editText.trim()}
              >
                <Text style={s.editSaveBtnText}>{t('tasks.edit.save')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.sheetCancel} onPress={() => setEditTask(null)}>
                <Text style={[s.sheetCancelText, { color: theme.muted }]}>{t('tasks.action.cancel')}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Completed task action: restore or delete side by side */}
        <Modal
          visible={!!completedActionTask}
          transparent
          animationType="fade"
          onRequestClose={() => setCompletedActionTask(null)}
        >
          <Pressable style={s.sheetBackdrop} onPress={() => setCompletedActionTask(null)}>
            <Pressable
              style={[s.sheetCard, { backgroundColor: theme.dark ? theme.surface : '#fff' }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={s.sideBySide}>
                <TouchableOpacity
                  style={[s.sideBySideBtn, { backgroundColor: theme.accent }]}
                  onPress={() => {
                    if (completedActionTask) restoreTask(completedActionTask)
                    setCompletedActionTask(null)
                  }}
                >
                  <Text style={s.sheetBtnText}>{t('tasks.action.restore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.sideBySideBtn, { backgroundColor: colors.error }]}
                  onPress={() => {
                    if (completedActionTask) deleteTask(completedActionTask)
                    setCompletedActionTask(null)
                  }}
                >
                  <Text style={s.sheetBtnText}>{t('tasks.action.delete')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.sheetCancel} onPress={() => setCompletedActionTask(null)}>
                <Text style={[s.sheetCancelText, { color: theme.muted }]}>{t('tasks.action.cancel')}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

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
        <QuickCapture />
      </SafeAreaView>
    </SwipeableScreen>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
      backgroundColor: theme.surface,
    },
    headerRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 6,
    },
    title: { fontFamily: typography.serif, fontSize: 26, color: theme.text },
    titleEm: { fontFamily: typography.serifItalic, color: theme.accent },
    sub: { fontFamily: typography.sans, fontSize: 13, color: theme.muted },
    list: { flex: 1 },
    listContent: { paddingTop: 8, paddingBottom: 20 },
    taskItem: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      borderWidth: 1.5, borderRadius: 12,
      padding: 10, paddingHorizontal: 12,
      marginHorizontal: 14, marginBottom: 8,
    },
    taskItemCompleted: { opacity: 0.5 },
    taskCheck: {
      width: 18, height: 18, borderRadius: 9, borderWidth: 2,
      alignItems: 'center', justifyContent: 'center',
    },
    checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
    taskInfo: { flex: 1 },
    taskName: { fontFamily: typography.sansBold, fontSize: 14 },
    taskMetaRow: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
    recurrenceBadge: { fontFamily: typography.sans, fontSize: 14 },
    taskNameDone: { textDecorationLine: 'line-through' },
    taskMeta: { fontFamily: typography.sans, fontSize: 12, marginTop: 2 },
    catBadge: {
      backgroundColor: 'rgba(91,126,201,0.15)',
      paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full,
    },
    catBadgeText: { fontFamily: typography.sansBold, fontSize: 11, color: theme.accent },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontFamily: typography.sans, fontSize: 15 },
    addArea: { paddingHorizontal: 14, paddingVertical: 10 },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, borderWidth: 1.5, borderRadius: radius.md, padding: 12,
    },
    addBtnText: { fontFamily: typography.sansBold, fontSize: 13 },
    micDot: { width: 6, height: 6, borderRadius: 3 },
    // Completed
    completedHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
    },
    completedTitle: {
      fontFamily: typography.sansBold, fontSize: 12,
      letterSpacing: 1.5, textTransform: 'uppercase',
    },
    completedArrow: { fontSize: 12 },
    // Action sheet
    sheetBackdrop: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end', padding: 14, paddingBottom: 30,
    },
    sheetCard: { borderRadius: 20, padding: 20 },
    sheetTitle: {
      fontFamily: typography.serifItalic, fontSize: 18,
      textAlign: 'center', marginBottom: 16,
    },
    sheetBtn: {
      borderRadius: radius.md, padding: 14,
      alignItems: 'center', marginBottom: 8,
    },
    sheetBtnText: { fontFamily: typography.sansBold, fontSize: 15, color: '#fff' },
    sideBySide: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    sideBySideBtn: {
      flex: 1,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    sheetCancel: { padding: 10, alignItems: 'center' },
    sheetCancelText: { fontFamily: typography.sans, fontSize: 14 },
    // Edit modal
    editCard: {
      borderRadius: 20, padding: 20, marginHorizontal: 14,
      maxHeight: '85%',
    },
    editTitle: {
      fontFamily: typography.serifItalic, fontSize: 20,
      textAlign: 'center', marginBottom: 14,
    },
    editInput: {
      borderWidth: 1.5, borderRadius: 12,
      padding: 12, paddingHorizontal: 14,
      fontFamily: typography.sans, fontSize: 15, marginBottom: 14,
    },
    editLabel: {
      fontFamily: typography.sansBold, fontSize: 11,
      letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
    },
    chipRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14,
    },
    chip: {
      paddingVertical: 5, paddingHorizontal: 10,
      borderRadius: radius.full, borderWidth: 1.5,
    },
    chipSel: {
      borderColor: theme.accent,
      backgroundColor: 'rgba(91,126,201,0.1)',
    },
    chipText: { fontFamily: typography.sansBold, fontSize: 11 },
    editSaveBtn: {
      borderRadius: radius.md, padding: 14, alignItems: 'center', marginBottom: 4,
    },
    editSaveBtnText: { fontFamily: typography.sansBold, fontSize: 15, color: '#fff' },
  })
