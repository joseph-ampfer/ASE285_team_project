import { useState, useEffect, useMemo } from 'react'
import TodoItem from './TodoItem'
import TaskDetailModal from './TaskDetailModal'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function compareByDueDate(a, b) {
  const da = (a?.date || '').trim()
  const db = (b?.date || '').trim()
  const validA = ISO_DATE.test(da)
  const validB = ISO_DATE.test(db)
  if (validA && validB) return da.localeCompare(db)
  if (validA && !validB) return -1
  if (!validA && validB) return 1
  return Number(a._id) - Number(b._id)
}

function TodoList({ todos, onAdd, onEdit, onDelete, onAddSubtask, onToggleSubtask }) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalMode, setModalMode] = useState('view')
  const [isCreating, setIsCreating] = useState(false)

  const handleAddTask = (form) => {
    onAdd(form.title, form.date, form.description)
  }

  const handleUpdateTask = (id, form) => {
	onEdit(id, {
		title: form.title,
		date: form.date,
		description: form.description,
		status: form.status
	})
  }
  
  useEffect(() => {
    if (!selectedTask) return

    const updated = todos.find(t => t._id === selectedTask._id)
    if (updated) setSelectedTask(updated)

  }, [todos, selectedTask])

  const sortedTodos = useMemo(
    () => [...todos].sort(compareByDueDate),
    [todos]
  )

  const closeModal = () => {
    setSelectedTask(null)
    setIsCreating(false)
    setModalMode('view')
  }

  return (
    <div className="todo-list">
      <button onClick={() => setIsCreating(true)}>➕ Add Task</button>

      {todos.length === 0 && (
        <div className="todo-list-empty">
          <p>No todos yet! Add one above to get started.</p>
        </div>
      )}

      {sortedTodos.map(todo => (
        <TodoItem 
          key={todo._id}
          todo={todo}
          onDelete={onDelete}
          onSelect={(task, mode) => {
            setSelectedTask(task)
            setModalMode(mode)
          }}
        />
      ))}

      {(selectedTask || isCreating) && (
        <TaskDetailModal
          task={selectedTask}
          mode={isCreating ? 'create' : modalMode}
          onClose={closeModal}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={onDelete}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
        />
      )}
    </div>
  )
}

export default TodoList

