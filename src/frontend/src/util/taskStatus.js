/** Matches backend KanbanStatus string values */
export function taskStatusModifierClass(status) {
  if (status === 'done') return 'task--done'
  if (status === 'in-progress') return 'task--in-progress'
  return ''
}
