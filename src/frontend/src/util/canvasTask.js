/**
 * Tasks synced from Canvas store a numeric canvasAssignmentId.
 */
export function isCanvasTask(todo) {
  const id = todo?.canvasAssignmentId
  if (id == null) return false
  if (typeof id === 'number') return !Number.isNaN(id)
  if (typeof id === 'string') return id.trim() !== ''
  return false
}
