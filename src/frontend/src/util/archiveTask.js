const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Calendar days from due date to today (local midnight). Positive = due is in the past. */
export function daysSinceDueDate(dueDateStr) {
  const d = (dueDateStr || '').trim()
  if (!ISO_DATE.test(d)) return null
  const [y, m, day] = d.split('-').map(Number)
  const due = new Date(y, m - 1, day)
  const today = new Date()
  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - due) / 86400000)
}

/** Done tasks whose due date was at least 7 days ago — list “Archive”, hidden from Kanban Done. */
export function isArchivedDoneTask(todo) {
  if (todo?.status !== 'done') return false
  const days = daysSinceDueDate(todo.date)
  if (days == null) return false
  return days >= 7
}
