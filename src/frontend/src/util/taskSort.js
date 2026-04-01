const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function compareByDueDate(a, b) {
  const da = (a?.date || '').trim()
  const db = (b?.date || '').trim()
  const validA = ISO_DATE.test(da)
  const validB = ISO_DATE.test(db)
  if (validA && validB) return da.localeCompare(db)
  if (validA && !validB) return -1
  if (!validA && validB) return 1
  return Number(a._id) - Number(b._id)
}

function completedAtMs(todo) {
  if (todo?.completedAt == null) return null
  const t = new Date(todo.completedAt).getTime()
  return Number.isNaN(t) ? null : t
}

/** Done column: older completion first (top), most recent last (bottom). */
export function compareKanbanDoneOrder(a, b) {
  const ta = completedAtMs(a)
  const tb = completedAtMs(b)
  if (ta != null && tb != null && ta !== tb) return ta - tb
  if (ta != null && tb == null) return -1
  if (ta == null && tb != null) return 1
  return Number(a._id) - Number(b._id)
}

/** List grouped Done: most recently completed first (top). */
export function compareDoneRecentFirst(a, b) {
  const ta = completedAtMs(a)
  const tb = completedAtMs(b)
  if (ta != null && tb != null && tb !== ta) return tb - ta
  if (ta != null && tb == null) return -1
  if (ta == null && tb != null) return 1
  return Number(b._id) - Number(a._id)
}
